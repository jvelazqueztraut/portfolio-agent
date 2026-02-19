#!/usr/bin/env python3
"""
Simple script to test CORS configuration
"""
import requests
import json

def test_cors():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing CORS configuration...")
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test CORS debug endpoint
    try:
        response = requests.get(f"{base_url}/debug/cors")
        print(f"✅ CORS debug: {response.status_code}")
        cors_info = response.json()
        print(f"📋 CORS Origins: {cors_info['cors_origins']}")
        print(f"🌍 Environment: {cors_info['environment']}")
    except Exception as e:
        print(f"❌ CORS debug failed: {e}")
    
    # Test session creation
    try:
        response = requests.post(f"{base_url}/api/sessions")
        print(f"✅ Session creation: {response.status_code}")
        if response.status_code == 200:
            session_data = response.json()
            print(f"📝 Session ID: {session_data['session_id']}")
    except Exception as e:
        print(f"❌ Session creation failed: {e}")

if __name__ == "__main__":
    test_cors()
