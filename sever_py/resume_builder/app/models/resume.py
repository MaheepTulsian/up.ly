from pydantic import BaseModel

class ResumeTemplate(BaseModel):
    basics: Dict[str, str]
    experience: List[Dict]
    education: List[Dict]
    skills: List[Dict]
    certifications: List[Dict]

class JobDescription(BaseModel):
    text: str

class UserProfile(BaseModel):
    name: str
    experience: List[Dict]
    education: List[Dict]
    skills: List[str]
    certifications: List[str]

class GeneratedResume(BaseModel):
    resume_json: Dict
