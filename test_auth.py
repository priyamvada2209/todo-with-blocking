import sys
import traceback
import os

# Change to src directory so app module is found
os.chdir('/c/Users/pc/OneDrive/Desktop/backend_projects/Todo-with-blocking/src')
sys.path.insert(0, '/c/Users/pc/OneDrive/Desktop/backend_projects/Todo-with-blocking/src')

try:
    from app.api.v1.auth import schema, service
    from app.config import Settings
    from dotenv import load_dotenv
    
    # Load from parent directory
    os.chdir('/c/Users/pc/OneDrive/Desktop/backend_projects/Todo-with-blocking')
    load_dotenv()
    settings = Settings.from_env()
    
    # Test payload
    payload = schema.parse_register_payload({
        "name": "Test User",
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    
    print("Parsed payload:", payload)
    print("Settings loaded successfully")
    
    # Try calling register_user
    user, tokens = service.register_user(
        payload["name"],
        payload["email"],
        payload["password"],
        settings
    )
    
    print("User created:", user.email)
    print("Tokens:", tokens.keys())
    
except Exception as e:
    print("ERROR:", str(e))
    traceback.print_exc()
