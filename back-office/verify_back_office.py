
import requests
import time
import sys

BACK_OFFICE_URL = "http://localhost:5000"

def verify_back_office():
    print("Verifying Back Office API...")
    try:
        response = requests.get(f"{BACK_OFFICE_URL}/api/sync", timeout=5)
        if response.status_code == 200:
            print("SUCCESS: Back Office API is running and responding.")
            return True
        else:
            print(f"FAILURE: Back Office API returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("FAILURE: Could not connect to Back Office API. Is the server running?")
        return False
    except Exception as e:
        print(f"FAILURE: An error occurred: {e}")
        return False

if __name__ == "__main__":
    success = verify_back_office()
    if not success:
        sys.exit(1)
