import logging
from fastapi import FastAPI, HTTPException
import uvicorn
<<<<<<< HEAD
from pydantic import BaseModel
from web_agent import InterviewState, workflow, check_output_and_answer, filter_requests_on_user_query
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Candidate Evaluation API",
    description="API for generating interview questions and evaluating candidate answers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
=======
>>>>>>> upstream/main

# Import the router
from routers.mock_interview_routes import router as candidate_router
from routers.resume_routers import router as resume_router

<<<<<<< HEAD
class InterviewRequest(BaseModel):
    company_name: str
    job_role: str
    job_description: str
    

class QuestionRequest(BaseModel):
    dsa_question: dict
    web_question: dict
    user_query: str

=======
>>>>>>> upstream/main
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title="Candidate Evaluation API",
    description="API for generating interview questions and evaluating candidate answers",
    version="1.0.0"
)

# Include the candidate router
app.include_router(candidate_router)
app.include_router(resume_router)

# Add a simple root endpoint for API health check
@app.get("/", response_description="API Status")
async def root():
    return {"status": "online", "message": "Candidate Evaluation API is running"}

<<<<<<< HEAD
@app.post("/generate_interview_questions")
async def generate_interview_questions(request: InterviewRequest):
    try:
        # Initialize the state with input data
        initial_state = InterviewState(input={
            "company_name": request.company_name,
            "job_role": request.job_role,
            "job_description": request.job_description
        })

        # Execute the workflow
        app = workflow.compile()
        result = app.invoke(initial_state)

        # Parse the JSON result
        parsed_json = json.loads(result['final_json'])

        # Check and validate the output
        validated_json = check_output_and_answer(
            parsed_json,
            job_role=request.job_role,
            company_name=request.company_name,
            job_description=request.job_description
        )

        return validated_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/modify_interview_questions")
async def modify_interview_questions(request: QuestionRequest):
    try:
        # Call the function to filter and modify questions
        result = filter_requests_on_user_query(
            request.dsa_question,
            request.web_question,
            request.user_query
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

# Run the application if executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7070)
=======
# Run the application if executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9990, reload=True)
>>>>>>> upstream/main
