import os
from dotenv import load_dotenv
from google import genai

# 1. Load our secret keys from the .env file
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

# 2. Wake up the Google Gemini AI using the new Client
client = genai.Client(api_key=GEMINI_KEY)

print("Waking up the Manager Agent...")

# 3. Give the AI its first command using a stable model!
prompt = "Hello! You are the Manager Agent for ArcHive. In one short sentence, what is your job?"

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)

# 4. Print what the AI says
print("🤖 Manager Agent says:", response.text)