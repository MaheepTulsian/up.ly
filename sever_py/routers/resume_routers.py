import os
import json
import re
import logging
from typing import Dict, Any
from fastapi import HTTPException, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain imports
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# System Prompts
SYSTEM_PROMPT = """You are an advanced AI resume builder with expertise in creating professional, tailored resumes. Your core responsibilities include:

RESUME CREATION GUIDELINES:
1. Analyze the job description meticulously to identify critical requirements
2. Extract and highlight the most relevant skills and experiences from the user profile
3. Create a resume that precisely matches the job description
4. Use powerful, action-oriented language
5. Quantify achievements wherever possible
6. Ensure the resume follows the exact provided template structure

KEY FOCUS AREAS:
- Align resume content with specific job requirements
- Showcase transferable and most relevant skills
- Create a compelling narrative of professional capabilities
- Maintain professional formatting and language
- Emphasize achievements over routine responsibilities

CRITICAL SKILLS STRATEGY:
- Extract ALL skills from user profile
- Match skills with job description requirements
- Include technical and soft skills
- Prioritize skills most relevant to the target role

FORMATTING PRINCIPLES:
- Use strong action verbs
- Highlight measurable achievements
- Maintain clean, professional structure
- Ensure logical flow of information
- Optimize for Applicant Tracking Systems (ATS)"""

UPDATE_SYSTEM_PROMPT = """You are a professional resume optimization specialist focused on strategic resume enhancement. Your mission is to:

RESUME UPDATE GUIDELINES:
1. Thoroughly analyze the existing resume and new job description
2. Identify gaps between current resume and job requirements
3. Strategically update resume sections to improve alignment
4. Address specific user update requests
5. Maintain the integrity of the original resume's core information
6. Follow the exact template structure
7. Provide clear, actionable resume improvements

UPDATE STRATEGY:
- Compare existing resume against new job description
- Highlight transferable skills and experiences
- Reframe existing experiences to match new requirements
- Add or modify sections to increase relevance
- Ensure updates are truthful and substantiated"""

# Pydantic Models
class ResumeCreateRequest(BaseModel):
    user_profile: Dict[str, Any]
    job_description: str = ""

class ResumeUpdateRequest(BaseModel):
    previous_resume: Dict[str, Any]
    job_description: str = ""
    user_query: str = ""

class ResumeResponse(BaseModel):
    resume: Dict[str, Any]

# Router setup
router = APIRouter(
    prefix="/resume",
    tags=["resume"],
    responses={404: {"description": "Not found"}}
)

def get_llm(model=None):
    """Initialize language model with error handling."""
    try:
        return ChatGroq(
            model=model or "llama-3.3-70b-versatile",
            temperature=0.7,
            max_retries=2
        )
    except Exception as e:
        logger.error(f"LLM Initialization Error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM Error: {e}")

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Flexible JSON extraction with multiple strategies."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        extraction_patterns = [
            r'```json(.*?)```',
            r'```(.*?)```',
            r'\{.*\}'
        ]
        
        for pattern in extraction_patterns:
            match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
            if match:
                try:
                    return json.loads(match.group(1).strip())
                except Exception:
                    continue
        
        logger.warning(f"JSON Extraction Failed: {text}")
        return {}

def create_default_resume_template():
    """Create a comprehensive default resume template."""
    return {
        "basics": {
            "firstName": "",
            "lastName": "",
            "email": "",
            "phone": "",
            "address": {"city": "", "state": ""},
            "socials": {"linkedIn": "", "github": ""}
        },
        "workExperience": [
            {
                "position": "",
                "company": "",
                "startDate": "",
                "endDate": "",
                "isCurrent": False,
                "description": ""
            }
        ],
        "projects": [
            {
                "title": "",
                "startDate": "",
                "endDate": "",
                "description": "",
                "technologiesUsed": []
            }
        ],
        "education": [
            {
                "institution": "",
                "degree": "",
                "fieldOfStudy": "",
                "startDate": "",
                "endDate": ""
            }
        ],
        "achievements": [
            {
                "title": "",
                "issuer": "",
                "date": "",
                "description": ""
            }
        ],
        "skills": [],
        "certifications": [
            {
                "name": "",
                "issuingOrganization": "",
                "issueDate": ""
            }
        ]
    }

@router.post("/create")
async def create_resume(request: ResumeCreateRequest):
    """Create a new resume with comprehensive processing."""
    try:
        llm = get_llm()
        
        # Convert inputs to strings
        user_profile_str = json.dumps(request.user_profile, indent=2)
        job_description = request.job_description
        resume_template = create_default_resume_template()
        template_str = json.dumps(resume_template, indent=2)
        
        # Prepare LLM messages
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"""
            Create a professional resume:
            
            USER PROFILE:
            {user_profile_str}
            
            JOB DESCRIPTION:
            {job_description}
            
            RESUME TEMPLATE:
            {template_str}
            
            Generate a compelling, tailored resume in JSON format.
            """)
        ]
        
        # Get LLM response
        response = llm.invoke(messages)
        
        # Extract JSON 
        resume_json = extract_json_from_text(response.content)
        
        # Fallback to template if no valid JSON
        if not resume_json:
            resume_json = resume_template
        
        return JSONResponse(content={"resume": resume_json})
    
    except Exception as e:
        logger.error(f"Resume Creation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resume creation failed: {str(e)}")

@router.post("/update")
async def update_resume(request: ResumeUpdateRequest):
    """Update resume with strategic enhancements."""
    try:
        llm = get_llm()
        
        # Convert inputs to strings
        previous_resume_str = json.dumps(request.previous_resume, indent=2)
        job_description = request.job_description
        user_query = request.user_query
        resume_template = create_default_resume_template()
        template_str = json.dumps(resume_template, indent=2)
        
        # Prepare LLM messages
        messages = [
            SystemMessage(content=UPDATE_SYSTEM_PROMPT),
            HumanMessage(content=f"""
            Strategic Resume Update Request:
            
            CURRENT RESUME:
            {previous_resume_str}
            
            JOB DESCRIPTION:
            {job_description}
            
            USER SPECIFIC REQUEST:
            {user_query}
            
            RESUME TEMPLATE:
            {template_str}
            
            Provide an optimized resume update.
            """)
        ]
        
        # Get LLM response
        response = llm.invoke(messages)
        
        # Extract JSON 
        updated_resume_json = extract_json_from_text(response.content)
        
        # Fallback to previous resume if no valid JSON
        if not updated_resume_json:
            updated_resume_json = request.previous_resume
        
        return JSONResponse(content={"resume": updated_resume_json})
    
    except Exception as e:
        logger.error(f"Resume Update Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resume update failed: {str(e)}")
