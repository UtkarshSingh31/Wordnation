from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

try:
    model=ChatGoogleGenerativeAI(model='gemini-2.5-flash')
except Exception :
    print(f"Model not loaded")
    
