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
    """Build and return the resume builder agent."""
    # Create the graph builder
    graph_builder = StateGraph(ResumeBuilderState)
    
    # Add nodes
    graph_builder.add_node("analyze_job", analyze_job)
    graph_builder.add_node("review_profile", review_profile)
    graph_builder.add_node("generate_resume", generate_resume)
    graph_builder.add_node("handle_error", handle_error)
    
    # Add edges
    graph_builder.add_edge("analyze_job", "review_profile")
    graph_builder.add_edge("review_profile", "generate_resume")
    
    # Add conditional edges
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


# Example usage
if __name__ == "__main__":
    # Sample inputs
    job_description = """
    Senior Software Engineer - Python
    
    We are looking for a Senior Software Engineer with strong Python expertise to join our team.
    The ideal candidate has at least 5 years of experience in Python development, knowledge of web frameworks like Django or Flask,
    and experience with cloud platforms (AWS, GCP, or Azure). Familiarity with microservices architecture and container technologies
    like Docker and Kubernetes is a plus. Must have strong problem-solving skills and be able to mentor junior developers.
    """
    
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
    resume = build_resume(job_description, user_profile, resume_template)
    
    # Print the result
    print(json.dumps(resume, indent=2))
