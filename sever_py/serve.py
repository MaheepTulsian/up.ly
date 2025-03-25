from  fastapi import FastAPI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
import json 
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
import os 
from dotenv import load_dotenv
import uvicorn 
from langserve import add_routes  
from langchain_core.output_parsers import StrOutputParser 

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
model = ChatGroq(model = "Gemma2-9b-It",groq_api_key = groq_api_key)
## 1 Create a prompt template
system_template = "Translate the following into {language}:"

prompt_template = ChatPromptTemplate.from_messages([("system",system_template),("user","{text}"),])

parser = StrOutputParser()


## create chain 

chain = prompt_template | model | parser 

app = FastAPI(title="LAngchain Server",
              version="0.1",
              description="A simple server using LAngchain to translate text into different languages")

add_routes(
    app,
    chain,
    path = "/translate"
)

if __name__ == "__main__":
    uvicorn.run(app,host="localhost",port=8000)
    

