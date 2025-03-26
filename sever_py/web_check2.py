# -*- coding: utf-8 -*-
"""Multi-Agent Interview Question Aggregator System"""
# Install required packages
#pip install -q langchain-groq langgraph python-dotenv requests beautifulsoup4

import os
import json
from typing import Literal, Dict, List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.types import Command

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(temperature=0.5, model_name="mixtral-8x7b-32768", groq_api_key=groq_api_key)

# ======================
# Data Models
# ======================
class InterviewQuestion(BaseModel):
    question: str
    source: str
    difficulty: Optional[str] = None
    category: Optional[str] = None
    url: str

    @validator('url')
    def validate_url(cls, v):
        if not v.startswith('http'):
            raise ValueError('Invalid URL format')
        return v

class AgentState(BaseModel):
    company: str
    role: str
    job_description: str
    technical_questions: List[InterviewQuestion] = []
    hr_questions: List[InterviewQuestion] = []
    current_task: str = "initializing"

# ======================
# Agent Definitions
# ======================
class TechnicalScraper:
    def __init__(self, llm):
        self.llm = llm
        
    async def search_leetcode(self, state: AgentState) -> List[InterviewQuestion]:
        """Search LeetCode API for DSA questions"""
        query = f"{state.company} {state.role} DSA interview questions"
        # Implementation using LeetCode API (pseudo-code)
        questions = [
            InterviewQuestion(
                question="Two Sum", 
                source="LeetCode",
                difficulty="Easy",
                url="https://leetcode.com/problems/two-sum"
            )
        ]
        return questions

    async def __call__(self, state: AgentState) -> Command[Literal["supervisor", END]]:
        state.current_task = "technical_scraping"
        questions = await self.search_leetcode(state)
        state.technical_questions.extend(questions)
        return Command(
            goto="supervisor",
            update=state.dict()
        )

class HRScraper:
    def __init__(self, llm):
        self.llm = llm
        
    async def search_glassdoor(self, state: AgentState) -> List[InterviewQuestion]:
        """Scrape HR questions from job portals"""
        query = f"{state.company} {state.role} behavioral interview questions"
        # Implementation using web scraping (pseudo-code)
        questions = [
            InterviewQuestion(
                question="Tell me about a time you disagreed with a manager",
                source="Glassdoor",
                category="Behavioral",
                url="https://www.glassdoor.com/interview/example"
            )
        ]
        return questions

    async def __call__(self, state: AgentState) -> Command[Literal["supervisor", END]]:
        state.current_task = "hr_scraping"
        questions = await self.search_glassdoor(state)
        state.hr_questions.extend(questions)
        return Command(
            goto="supervisor",
            update=state.dict()
        )

class FormatterAgent:
    def __init__(self, llm):
        self.llm = llm

    def format_output(self, state: AgentState) -> Dict:
        """Format questions into structured JSON"""
        return {
            "company": state.company,
            "role": state.role,
            "technical_questions": [
                {
                    "question": q.question,
                    "difficulty": q.difficulty,
                    "url": q.url
                } for q in state.technical_questions
            ],
            "hr_questions": [
                {
                    "question": q.question,
                    "category": q.category,
                    "url": q.url
                } for q in state.hr_questions
            ]
        }

    async def __call__(self, state: AgentState) -> Command[Literal["supervisor", END]]:
        state.current_task = "formatting"
        formatted = self.format_output(state)
        return Command(
            goto=END,
            update={"final_output": formatted}
        )

# ======================
# Graph Construction
# ======================
builder = StateGraph(AgentState)

# Create agent instances
technical_agent = TechnicalScraper(llm)
hr_agent = HRScraper(llm)
formatter = FormatterAgent(llm)

# Add nodes
builder.add_node("technical", technical_agent)
builder.add_node("hr", hr_agent)
builder.add_node("formatter", formatter)
builder.add_node("supervisor", lambda state: state)

# Set up edges
builder.add_edge("technical", "supervisor")
builder.add_edge("hr", "supervisor")
builder.add_edge("formatter", END)

# Conditional routing
def route_to_agent(state: AgentState):
    if not state.technical_questions:
        return "technical"
    elif not state.hr_questions:
        return "hr"
    return "formatter"

builder.add_conditional_edges(
    "supervisor",
    route_to_agent,
    {
        "technical": "technical",
        "hr": "hr",
        "formatter": "formatter"
    }
)

builder.set_entry_point("supervisor")
workflow = builder.compile()

# ======================
# Execution
# ======================
def run_interview_query(company: str, role: str, job_desc: str):
    initial_state = AgentState(
        company=company,
        role=role,
        job_description=job_desc
    )
    
    for step in workflow.stream(initial_state):
        if "__end__" not in step:
            print(f"Current Task: {step['current_task']}")
            
    return step.get("final_output", {})

# Example Usage
if __name__ == "__main__":
    result = run_interview_query(
        company="Google",
        role="Software Engineer",
        job_desc="Looking for full-stack developers with 5+ years experience"
    )
    
    print("\nFinal Output:")
    print(json.dumps(result, indent=2))
