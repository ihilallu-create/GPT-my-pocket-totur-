#!/usr/bin/env python3
"""
Quick Backend Test for My Pocket Tutor Application
Focused test for the three specific endpoints requested:
1. /api/ai-chat - AI assistant functionality
2. /api/students/login - Student login functionality  
3. /api/bookings - Booking management functionality
"""

import requests
import json
import uuid
from datetime import datetime
import os
import sys

# Get backend URL from environment
import dotenv
dotenv.load_dotenv('/app/frontend/.env')
BACKEND_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_URL}")

class QuickTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_ai_chat_endpoint(self):
        """Test /api/ai-chat endpoint with Arabic message"""
        try:
            chat_data = {
                "message": "ما هي أفضل طريقة لدراسة الرياضيات؟",
                "language": "ar",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["response", "language"]
                
                if all(field in data for field in required_fields):
                    if (data["language"] == "ar" and 
                        len(data["response"]) > 0 and
                        data["response"] != chat_data["message"]):
                        self.log_test("AI Chat Endpoint", True, f"AI responded in Arabic: {data['response'][:100]}...")
                        return True
                    else:
                        self.log_test("AI Chat Endpoint", False, f"Invalid response data: {data}")
                else:
                    self.log_test("AI Chat Endpoint", False, f"Missing fields in response: {data}")
            else:
                self.log_test("AI Chat Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("AI Chat Endpoint", False, f"Exception: {str(e)}")
        
        return False

    def test_student_login_endpoint(self):
        """Test /api/students/login endpoint"""
        # First create a test student
        test_student_data = {
            "name": "طالب اختبار سريع",
            "phone": "+966501234567", 
            "email": f"quicktest.{uuid.uuid4().hex[:8]}@university.edu.sa",
            "university_name": "جامعة الملك سعود",
            "student_id": f"QT{uuid.uuid4().hex[:8].upper()}",
            "password": "QuickTest123!"
        }
        
        try:
            # Create student first
            signup_response = self.session.post(f"{API_URL}/students/signup", json=test_student_data)
            if signup_response.status_code != 200:
                self.log_test("Student Login Endpoint", False, f"Failed to create test student: {signup_response.status_code}")
                return False
            
            # Now test login
            login_data = {
                "email": test_student_data["email"],
                "password": test_student_data["password"]
            }
            
            response = self.session.post(f"{API_URL}/students/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "student"]
                
                if all(field in data for field in required_fields):
                    # Store auth token for booking tests
                    self.auth_token = data["access_token"]
                    student_data = data["student"]
                    if student_data["email"] == test_student_data["email"]:
                        self.log_test("Student Login Endpoint", True, f"Login successful for: {student_data['name']}")
                        return True
                    else:
                        self.log_test("Student Login Endpoint", False, "Student data mismatch in response")
                else:
                    self.log_test("Student Login Endpoint", False, f"Missing fields in response: {data}")
            else:
                self.log_test("Student Login Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Student Login Endpoint", False, f"Exception: {str(e)}")
        
        return False

    def test_bookings_endpoint(self):
        """Test /api/bookings endpoints (create and get)"""
        if not self.auth_token:
            self.log_test("Bookings Endpoint", False, "No auth token available - login test must pass first")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test creating a booking
            booking_data = {
                "tutor_id": str(uuid.uuid4()),
                "subject": "الرياضيات",
                "session_type": "individual",
                "date": "2024-12-25",
                "time": "14:00"
            }
            
            create_response = self.session.post(f"{API_URL}/bookings", json=booking_data, headers=headers)
            
            if create_response.status_code == 200:
                booking = create_response.json()
                required_fields = ["id", "student_id", "tutor_id", "subject", "session_type", "date", "time", "status"]
                
                if all(field in booking for field in required_fields):
                    booking_id = booking["id"]
                    
                    # Test getting bookings
                    get_response = self.session.get(f"{API_URL}/bookings", headers=headers)
                    
                    if get_response.status_code == 200:
                        bookings_list = get_response.json()
                        if isinstance(bookings_list, list) and len(bookings_list) > 0:
                            # Check if our created booking is in the list
                            found_booking = any(b["id"] == booking_id for b in bookings_list)
                            if found_booking:
                                self.log_test("Bookings Endpoint", True, f"Successfully created and retrieved booking: {booking_id}")
                                return True
                            else:
                                self.log_test("Bookings Endpoint", False, "Created booking not found in bookings list")
                        else:
                            self.log_test("Bookings Endpoint", False, "Bookings list is empty or not a list")
                    else:
                        self.log_test("Bookings Endpoint", False, f"Failed to get bookings: {get_response.status_code}")
                else:
                    self.log_test("Bookings Endpoint", False, f"Missing fields in booking response: {booking}")
            else:
                self.log_test("Bookings Endpoint", False, f"Failed to create booking: {create_response.status_code}, Response: {create_response.text}")
                
        except Exception as e:
            self.log_test("Bookings Endpoint", False, f"Exception: {str(e)}")
        
        return False

    def run_quick_tests(self):
        """Run the three specific endpoint tests"""
        print("=" * 60)
        print("QUICK BACKEND STABILITY TEST")
        print("Testing the three critical endpoints after recent updates")
        print("=" * 60)
        
        # Test the three specific endpoints
        print("1. Testing AI Chat Endpoint (/api/ai-chat)")
        ai_chat_success = self.test_ai_chat_endpoint()
        
        print("2. Testing Student Login Endpoint (/api/students/login)")
        login_success = self.test_student_login_endpoint()
        
        print("3. Testing Bookings Endpoint (/api/bookings)")
        bookings_success = self.test_bookings_endpoint()
        
        # Print summary
        self.print_summary()
        
        return ai_chat_success and login_success and bookings_success

    def print_summary(self):
        """Print test results summary"""
        print("=" * 60)
        print("QUICK TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        else:
            print("\n🎉 ALL TESTS PASSED! System is stable after recent updates.")
        
        print("=" * 60)

if __name__ == "__main__":
    tester = QuickTester()
    success = tester.run_quick_tests()
    sys.exit(0 if success else 1)