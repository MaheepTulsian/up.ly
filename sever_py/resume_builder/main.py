



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
