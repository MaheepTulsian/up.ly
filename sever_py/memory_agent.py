import os
import json
import re
from typing import TypedDict, Annotated, List, Dict, Any
import operator
from dotenv import load_dotenv
import datetime
# LangChain imports
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
# from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langgraph.store.memory import InMemoryStore
import uuid

# Create memory store
memory_store = InMemoryStore()


from langgraph.graph import StateGraph, START, END
# LangGraph imports
# from langgraph.graph import StateGraph, END

# Load environment variables
load_dotenv()

class ResumeBuilderState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    job_description: str
    user_profile: Dict[str, Any]
    resume_template: Dict[str, Any]
    resume_json: Dict[str, Any]
    error: str
SYSTEM_PROMPT = """You are an expert resume builder agent designed to create tailored, professional resumes. Your task is to analyze job descriptions, match them with user profiles, and generate optimized resumes that follow specific templates.

GUIDELINES:
1. Carefully analyze the job description to identify key requirements, skills, and qualifications.
2. Review the user's profile to understand their experience, skills, education, and achievements.
3. Tailor the resume to highlight experiences and skills most relevant to the job description.
4. Use strong action verbs and quantify achievements whenever possible.
5. Follow the exact structure of the provided template.
6. Format the final output as valid JSON that matches the template structure.
7. Be concise, professional, and honest - do not invent information not present in the user's profile.

PROCESS:
1. Analyze the job requirements to identify key skills and qualifications
2. Match the user's profile with the job requirements
3. Create a tailored resume that highlights relevant experiences
4. Format the resume according to the provided template
5. Return the result as a valid JSON object

Remember, the goal is to create a resume that will help the user stand out while accurately representing their qualifications for the specific job they're applying to.
"""

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Extract JSON object from text with improved error handling."""
    # Find content between triple backticks
    json_match = re.search(r"``````", text)
    if json_match:
        json_str = json_match.group(1)
    else:
        # If no backticks, try to find JSON object directly
        json_match = re.search(r"(\{[\s\S]*\})", text)
        if json_match:
            json_str = json_match.group(1)
        else:
            # If still no match, use the whole text
            json_str = text
    
    # Clean up common JSON formatting errors
    json_str = re.sub(r',(\s*[\]}])', r'\1', json_str)  # Remove trailing commas
    
    try:
        # Try to parse the JSON
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        try:
            # Try using a more lenient JSON parser as fallback
            import json5
            return json5.loads(json_str)
        except:
            # If all parsing fails, return empty dict
            return {}

def get_llm(provider="groq", model=None):
    """Get the language model based on provider."""
    # if provider == "groq":
    return ChatGroq(
            model = model or "llama-3.3-70b-versatile",
            temperature=0.2,
            max_retries = 2
        )

def build_resume_with_memory(job_description: str, user_profile: Dict[str, Any], resume_template: Dict[str, Any], user_id: str = None) -> Dict[str, Any]:
    """
    Build a resume using the AI agent and store it in memory.
    
    Args:
        job_description (str): The job description text
        user_profile (dict): User's profile information
        resume_template (dict): Template structure for the resume
        user_id (str): Unique identifier for the user
        
    Returns:
        dict: The generated resume in JSON format
    """
    # Initialize the agent
    resume_agent = build_resume_builder_agent()
    
    # Generate user_id if not provided
    if not user_id:
        user_id = str(uuid.uuid4())
    
    # Initialize the state
    initial_state = {
        "messages": [],
        "job_description": job_description,
        "user_profile": user_profile,
        "resume_template": resume_template,
        "resume_json": {},
        "error": ""
    }
    
    # Run the agent
    final_state = resume_agent.invoke(initial_state)
    
    # Store the generated resume in memory
    namespace = (user_id, "resumes")
    memory_id = str(uuid.uuid4())
    
    memory_data = {
        "job_description": job_description,
        "resume": final_state["resume_json"],
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    memory_store.put(namespace, memory_id, memory_data)
    
    # Return the generated resume
    return final_state["resume_json"], memory_id, user_id

def conversational_resume_editor(state: ResumeBuilderState) -> Dict:
    """Process user instructions to update the resume in a conversational manner."""
    llm = get_llm()
    
    # Get the current resume and user instruction
    current_resume = state.get("resume_json", {})
    user_instruction = state.get("user_instruction", "")
    
    if not current_resume:
        return {
            "messages": state["messages"] + [
                AIMessage(content="I need to generate a resume first before I can update it. Let me do that for you.")
            ],
            "error": "No resume to update. Please generate a resume first."
        }
    
    messages = state["messages"] + [
        SystemMessage(content=f"""You are an expert resume editor. 
        You have a current resume in JSON format and need to update it based on the user's instructions.
        Current resume: {json.dumps(current_resume, indent=2)}
        
        Make precise updates to the resume based on the user's instructions while maintaining the same JSON structure.
        Return only the updated JSON with no additional text or explanations."""),
        HumanMessage(content=f"Please update this resume according to the following instruction: {user_instruction}")
    ]
    
    response = llm.invoke(messages)
    
    # Extract and validate JSON
    try:
        updated_json = extract_json_from_text(response.content)
        
        if not updated_json:
            return {
                "messages": state["messages"] + [messages[-1], response],
                "error": "Failed to extract valid JSON from the response."
            }
        
        # Validate and fix JSON structure against the template
        updated_resume = validate_json_structure(updated_json, state["resume_template"])
        
        return {
            "messages": state["messages"] + [messages[-1], response],
            "resume_json": updated_resume,
            "user_instruction": ""  # Clear the instruction after processing
        }
    except Exception as e:
        return {
            "messages": state["messages"] + [messages[-1], response],
            "error": f"Error updating resume: {str(e)}"
        }

def validate_json_structure(json_data: Dict[str, Any], template: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and fix JSON structure against the template.
    Handles duplicate keys by keeping only the most complete version.
    """
    result = {}
    
    # Process each key in the template
    for key, value in template.items():
        if key not in json_data:
            # If key is missing in the generated JSON, use template value
            result[key] = value
        elif isinstance(value, list) and isinstance(json_data[key], list):
            # Handle list values (like certifications)
            result[key] = []
            for item in json_data[key]:
                if isinstance(item, dict):
                    # Validate each item against the template item
                    template_item = value[0] if len(value) > 0 else {}
                    valid_item = {k: item.get(k, v) for k, v in template_item.items()}
                    if any(v for v in valid_item.values()):  # Only add non-empty items
                        result[key].append(valid_item)
        elif isinstance(value, dict) and isinstance(json_data[key], dict):
            # Handle nested dictionaries
            result[key] = {k: json_data[key].get(k, v) for k, v in value.items()}
        else:
            # For simple values, use the generated value
            result[key] = json_data[key]
            
    return result


def analyze_job(state: ResumeBuilderState) -> Dict:
    """Analyze the job description and identify key requirements."""
    llm = get_llm()
    
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"""
        STEP 1: Analyze the job description below and identify the key requirements, skills, and qualifications:
        
        JOB DESCRIPTION:
        {state["job_description"]}
        
        Please provide a detailed analysis of what the employer is looking for in an ideal candidate.
        """)
    ]
    
    response = llm.invoke(messages)
    
    return {
        "messages": state["messages"] + [messages[1], response]
    }

def review_profile(state: ResumeBuilderState) -> Dict:
    """Review the user profile and match it with job requirements."""
    llm = get_llm()
    
    # Get the previous analysis from the messages
    previous_messages = state["messages"]
    
    profile_str = json.dumps(state["user_profile"], indent=2)
    
    messages = previous_messages + [
        HumanMessage(content=f"""
        STEP 2: Based on your analysis of the job requirements, review my profile below and identify the most relevant experiences, skills, and achievements that match the job requirements:
        
        MY PROFILE:
        {profile_str}
        
        Please list the key elements from my profile that should be highlighted in the resume.
        """)
    ]
    
    response = llm.invoke(messages)
    
    return {
        "messages": state["messages"] + [messages[-1], response]
    }
    
    
    
def chat_resume_update(current_resume, resume_template, current_user_id):
    """Provide a chat-like interface for updating the resume."""
    print("\n===== RESUME CHAT =====")
    print("Chat with me to update your resume. Type 'exit' to finish.")
    print("Examples of what you can say:")
    print("- Add Python to my skills")
    print("- Change my job title to Senior Software Engineer")
    print("- Add more details about my leadership experience")
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() in ['exit', 'quit', 'done']:
            print("Exiting resume chat.")
            break
        
        # Initialize the state for conversational update
        update_state = {
            "messages": [],
            "resume_json": current_resume,
            "resume_template": resume_template,
            "user_instruction": user_input,
            "error": ""
        }
        
        # Process the update
        try:
            update_state = conversational_resume_editor(update_state)
            
            if "error" in update_state and update_state["error"]:
                print(f"AI: I'm sorry, I couldn't update the resume: {update_state['error']}")
                continue
            
            # Update the current resume
            updated_resume = update_state["resume_json"]
            
            # Store the updated resume in memory
            namespace = (current_user_id, "resumes")
            memory_id = str(uuid.uuid4())
            
            memory_data = {
                "job_description": f"Updated via chat: {user_input}",
                "resume": updated_resume,
                "timestamp": datetime.datetime.now().isoformat()
            }
            
            memory_store.put(namespace, memory_id, memory_data)
            
            print("\nAI: I've updated your resume based on your request.")
            print("Would you like to see the updated resume? (y/n)")
            
            show_resume = input()
            if show_resume.lower() == 'y':
                print(json.dumps(updated_resume, indent=2))
            
            # Update the current resume reference
            current_resume = updated_resume
            
        except Exception as e:
            print(f"AI: I encountered an error while updating your resume: {str(e)}")
    
    return current_resume

def generate_resume(state: ResumeBuilderState) -> Dict:
    """Generate the resume in JSON format according to the template."""
    llm = get_llm("llama-3.1-8b-instant")  # Consider using "groq" instead if Llama has JSON issues
    
    template_str = json.dumps(state["resume_template"], indent=2)
    
    messages = state["messages"] + [
        HumanMessage(content=f"""
        STEP 3: Now, create my resume in JSON format that follows the exact structure of the provided template.
        
        TEMPLATE STRUCTURE:
        {template_str}
        
        Based on your analysis of the job requirements and my profile, create a tailored resume in JSON format.
        
        IMPORTANT: 
        1. The output must be valid JSON that matches the EXACT structure of the template.
        2. Include only the JSON object in your response, formatted with triple backticks.
        3. All fields in the template must be present in your output.
        4. Each section like "certifications" should appear EXACTLY ONCE in the output.
        5. Focus on highlighting experiences and skills most relevant to the job description.
        6. Make sure all brackets and braces are properly closed and balanced.
        7. Your output should look like this:
        
        ```
        {{
          "field1": "value1",
          "field2": "value2",
          ...
        }}
        ```
        """)
    ]
    
    response = llm.invoke(messages)
    
    # Extract and validate JSON
    try:
        raw_json = extract_json_from_text(response.content)
        
        if not raw_json:
            return {
                "messages": state["messages"] + [messages[-1], response],
                "error": "Failed to extract valid JSON from the response."
            }
        
        # Validate and fix JSON structure against the template
        resume_json = validate_json_structure(raw_json, state["resume_template"])
        
        return {
            "messages": state["messages"] + [messages[-1], response],
            "resume_json": resume_json
        }
    except Exception as e:
        return {
            "messages": state["messages"] + [messages[-1], response],
            "error": f"Error processing resume: {str(e)}"
        }

def handle_error(state: ResumeBuilderState) -> Dict:
    """Handle errors in the resume generation process."""
    llm = get_llm()
    
    template_str = json.dumps(state["resume_template"], indent=2)
    
    messages = state["messages"] + [
        HumanMessage(content=f"""
        ERROR: {state["error"]}
        
        Please try again to create a valid JSON resume that exactly matches the template structure below:
        
        {template_str}
        
        Your response should ONLY contain the JSON object wrapped in triple backticks, like this:
        
        ```
        {{
          "field1": "value1",
          "field2": "value2",
          ...
        }}
        ```
        """)
    ]
    
    response = llm.invoke(messages)
    
    try:
        resume_json = extract_json_from_text(response.content)
        
        if not resume_json:
            return {
                "messages": state["messages"] + [messages[-1], response],
                "error": "Still unable to extract valid JSON. Please check the template format."
            }
        
        return {
            "messages": state["messages"] + [messages[-1], response],
            "resume_json": resume_json,
            "error": ""  # Clear the error
        }
    except Exception as e:
        return {
            "messages": state["messages"] + [messages[-1], response],
            "error": f"Error processing resume: {str(e)}"
        }
        
        
        
        
def check_error_condition(state: ResumeBuilderState) -> str:
    """Check if there's an error that needs handling."""
    if state.get("error", ""):
        return "handle_error"
    return "end"


def build_resume_builder_agent():
    """Build and return the resume builder agent with conversational editing."""
    # Create the graph builder
    graph_builder = StateGraph(ResumeBuilderState)
    
    # Add nodes
    graph_builder.add_node("analyze_job", analyze_job)
    graph_builder.add_node("review_profile", review_profile)
    graph_builder.add_node("generate_resume", generate_resume)
    graph_builder.add_node("handle_error", handle_error)
    graph_builder.add_node("conversational_update", conversational_resume_editor)
    
    # Add edges
    graph_builder.add_edge("analyze_job", "review_profile")
    graph_builder.add_edge("review_profile", "generate_resume")
    
    # Add conditional edges for error handling
    graph_builder.add_conditional_edges(
        "generate_resume",
        check_error_condition,
        {
            "handle_error": "handle_error",
            "end": END
        }
    )
    
    graph_builder.add_conditional_edges(
        "handle_error",
        check_error_condition,
        {
            "handle_error": "handle_error",
            "end": END
        }
    )
    
    # Add conditional edge for conversational updates
    graph_builder.add_conditional_edges(
        "conversational_update",
        check_error_condition,
        {
            "handle_error": "handle_error",
            "end": END
        }
    )
    
    # Set the entry point
    graph_builder.set_entry_point("analyze_job")
    
    # Compile the graph
    return graph_builder.compile()


def build_resume(job_description: str, user_profile: Dict[str, Any], resume_template: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a resume using the AI agent.
    
    Args:
        job_description (str): The job description text
        user_profile (dict): User's profile information
        resume_template (dict): Template structure for the resume
        
    Returns:
        dict: The generated resume in JSON format
    """
    # Initialize the agent
    resume_agent = build_resume_builder_agent()
    
    # Initialize the state
    initial_state = {
        "messages": [],
        "job_description": job_description,
        "user_profile": user_profile,
        "resume_template": resume_template,
        "resume_json": {},
        "error": ""
    }
    
    # Run the agent
    final_state = resume_agent.invoke(initial_state)
    
    # Return the generated resume
    return final_state["resume_json"]
def get_previous_resumes(user_id: str) -> List[Dict]:
    """
    Retrieve all previous resumes for a user from memory.
    
    Args:
        user_id (str): Unique identifier for the user
        
    Returns:
        List[Dict]: List of previous resumes with their metadata
    """
    namespace = (user_id, "resumes")
    memories = memory_store.search(namespace)
    
    resumes = []
    for memory in memories:
        resumes.append({
            "memory_id": memory.key,
            "data": memory.value,
            "created_at": memory.created_at
        })
    
    return resumes




def main():
    import datetime
    from typing import List
    
    # Initialize user ID
    current_user_id = None
    current_resume = None
    current_memory_id = None
    
    while True:
        print("\n===== RESUME BUILDER =====")
        print("1. Create new resume")
        print("2. Update current resume")
        print("3. View previous resumes")
        print("4. Quit")
        
        choice = input("Enter your choice (1-4): ")
        
        if choice == "1":
            # Create new resume (existing code)
            job_description = input("Enter job description: ")
            
            # For simplicity, we're using the sample user profile
            # In a real application, you would collect this from the user
            user_profile = {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "123-456-7890",
                "summary": "Software engineer with 7 years of experience developing web applications using Python and various frameworks.",
                "experience": [
                    {
                        "company": "Tech Solutions Inc.",
                        "position": "Senior Developer",
                        "duration": "2020-Present",
                        "responsibilities": [
                            "Developed and maintained Python microservices",
                            "Led a team of 5 junior developers",
                            "Implemented CI/CD pipelines using GitHub Actions",
                            "Reduced API response time by 40% through optimization"
                        ]
                    },
                    {
                        "company": "WebDev Co.",
                        "position": "Python Developer",
                        "duration": "2017-2020",
                        "responsibilities": [
                            "Built web applications using Django and Flask",
                            "Integrated third-party APIs",
                            "Optimized database queries",
                            "Implemented automated testing"
                        ]
                    }
                ],
                "education": [
                    {
                        "degree": "Master of Computer Science",
                        "institution": "University of Technology",
                        "year": "2017"
                    },
                    {
                        "degree": "Bachelor of Science in Computer Engineering",
                        "institution": "State University",
                        "year": "2015"
                    }
                ],
                "skills": [
                    "Python", "Django", "Flask", "Docker", "Kubernetes", "AWS", "GCP", 
                    "Microservices", "RESTful APIs", "SQL", "NoSQL", "Git", "CI/CD", 
                    "Agile Methodologies", "Test-Driven Development"
                ],
                "certifications": [
                    "AWS Certified Developer - Associate",
                    "Certified Kubernetes Administrator"
                ]
            }
            
            resume_template = {
                "basics": {
                    "name": "",
                    "email": "",
                    "phone": "",
                    "summary": ""
                },
                "experience": [
                    {
                        "position": "",
                        "company": "",
                        "location": "",
                        "startDate": "",
                        "endDate": "",
                        "highlights": []
                    }
                ],
                "education": [
                    {
                        "institution": "",
                        "area": "",
                        "studyType": "",
                        "startDate": "",
                        "endDate": ""
                    }
                ],
                "skills": [
                    {
                        "name": "",
                        "level": "",
                        "keywords": []
                    }
                ],
                "certifications": [
                    {
                        "name": "",
                        "date": "",
                        "issuer": ""
                    }
                ]
            }
            
        
            
            # Build the resume
            resume, memory_id, user_id = build_resume_with_memory(job_description, user_profile, resume_template, current_user_id)
            current_user_id = user_id
            current_resume = resume
            current_memory_id = memory_id
            
            print("\nGenerated Resume:")
            print(json.dumps(resume, indent=2))
            print(f"\nResume stored with memory ID: {memory_id}")
            
        elif choice == "2":
            if not current_resume:
                print("No active resume to update. Please create a resume first.")
                continue
                
            print("\n===== RESUME UPDATER =====")
            print("Current resume:")
            print(json.dumps(current_resume, indent=2))
            print("\nWhat would you like to change? (Enter your instructions)")
            print("Examples:")
            print("- Add a new skill: Python")
            print("- Update my job title to Senior Software Engineer")
            print("- Add more details about my experience at Tech Solutions Inc.")
            
            user_instruction = input("\nYour instruction: ")
            
            # Initialize the agent
            resume_agent = build_resume_builder_agent()
            
            # Initialize the state for conversational update
            update_state = {
                "messages": [],
                "resume_json": current_resume,
                "resume_template": resume_template,
                "user_instruction": user_instruction,
                "error": ""
            }
            
            # Run the agent with the conversational update node
            try:
                # We need to directly invoke the conversational_update node
                update_state = conversational_resume_editor(update_state)
                
                if "error" in update_state and update_state["error"]:
                    print(f"Error: {update_state['error']}")
                    continue
                
                # Update the current resume
                current_resume = update_state["resume_json"]
                
                # Store the updated resume in memory
                namespace = (current_user_id, "resumes")
                memory_id = str(uuid.uuid4())
                
                memory_data = {
                    "job_description": "Updated via conversation",
                    "resume": current_resume,
                    "timestamp": datetime.datetime.now().isoformat()
                }
                
                memory_store.put(namespace, memory_id, memory_data)
                current_memory_id = memory_id
                
                print("\nUpdated Resume:")
                print(json.dumps(current_resume, indent=2))
                print(f"\nUpdated resume stored with memory ID: {memory_id}")
                
            except Exception as e:
                print(f"Error updating resume: {str(e)}")
            
        elif choice == "3":
            # View previous resumes (existing code)
            if not current_user_id:
                print("No resumes created yet. Please create a resume first.")
                continue
            
            previous_resumes = get_previous_resumes(current_user_id)
            
            if not previous_resumes:
                print("No previous resumes found.")
                continue
            
            print("\n===== PREVIOUS RESUMES =====")
            for i, resume_data in enumerate(previous_resumes, 1):
                created_at = resume_data["created_at"]
                job_desc = resume_data["data"]["job_description"][:50] + "..." if len(resume_data["data"]["job_description"]) > 50 else resume_data["data"]["job_description"]
                print(f"{i}. Created on {created_at} - Job: {job_desc}")
            
            resume_choice = input("\nEnter resume number to view (or press Enter to go back): ")
            if resume_choice.isdigit() and 1 <= int(resume_choice) <= len(previous_resumes):
                selected_resume = previous_resumes[int(resume_choice) - 1]
                print("\nSelected Resume:")
                print(json.dumps(selected_resume["data"]["resume"], indent=2))
            if not current_user_id:
                print("No resumes created yet. Please create a resume first.")
                continue
            
            previous_resumes = get_previous_resumes(current_user_id)
            
            if not previous_resumes:
                print("No previous resumes found.")
                continue
            
            print("\n===== PREVIOUS RESUMES =====")
            for i, resume_data in enumerate(previous_resumes, 1):
                created_at = resume_data["created_at"]
                job_desc = resume_data["data"]["job_description"][:50] + "..." if len(resume_data["data"]["job_description"]) > 50 else resume_data["data"]["job_description"]
                print(f"{i}. Created on {created_at} - Job: {job_desc}")
            
            resume_choice = input("\nEnter resume number to view (or press Enter to go back): ")
            if resume_choice.isdigit() and 1 <= int(resume_choice) <= len(previous_resumes):
                selected_resume = previous_resumes[int(resume_choice) - 1]
                print("\nSelected Resume:")
                print(json.dumps(selected_resume["data"]["resume"], indent=2))
                
                # Option to make this the current resume
                make_current = input("\nMake this your current resume? (y/n): ")
                if make_current.lower() == 'y':
                    current_resume = selected_resume["data"]["resume"]
                    current_memory_id = selected_resume["memory_id"]
                    print("Resume set as current.")
            
        elif choice == "4":
            print("Thank you for using Resume Builder. Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
























