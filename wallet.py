import os
import requests
from dotenv import load_dotenv

# 1. Load your secret Circle Key
load_dotenv()
CIRCLE_KEY = os.getenv("CIRCLE_API_KEY")

print("Connecting to Circle Arc Testnet...")

# 2. Set up the secure headers for Circle's API
url = "https://api.circle.com/v1/w3s/wallets"
headers = {
    "Authorization": f"Bearer {CIRCLE_KEY}",
    "Content-Type": "application/json"
}

# 3. Ping the Circle Server
try:
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        print("✅ SUCCESS! Connected to Circle Web3 Services.")
        print("Your wallet data:", response.json())
    else:
        print("⚠️ Connection worked, but returned status:", response.status_code)
        print("Message:", response.text)

except Exception as e:
    print("❌ Failed to connect:", e)