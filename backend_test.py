#!/usr/bin/env python3
"""
Backend API Testing for My Pocket Tutor Application
Tests student authentication and booking management systems
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

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_student_data = {
            "name": "أحمد محمد علي",
            "phone": "+966501234567", 
            "email": f"ahmed.test.{uuid.uuid4().hex[:8]}@university.edu.sa",
            "university_name": "جامعة الملك سعود",
            "student_id": f"STU{uuid.uuid4().hex[:8].upper()}",
            "password": "SecurePass123!"
        }
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

    def test_root_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = self.session.get(f"{API_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Root Endpoint", True, f"Response: {data}")
                else:
                    self.log_test("Root Endpoint", False, "Missing message in response")
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")

    def test_status_endpoints(self):
        """Test status endpoints"""
        try:
            # Test GET /api/status
            response = self.session.get(f"{API_URL}/status")
            if response.status_code == 200:
                self.log_test("GET Status Endpoint", True, f"Status: {response.status_code}")
            else:
                self.log_test("GET Status Endpoint", False, f"Status: {response.status_code}")
            
            # Test POST /api/status
            test_data = {"client_name": "test_client"}
            response = self.session.post(f"{API_URL}/status", json=test_data)
            if response.status_code == 200:
                data = response.json()
                if "client_name" in data and "id" in data:
                    self.log_test("POST Status Endpoint", True, f"Created status check with ID: {data['id']}")
                else:
                    self.log_test("POST Status Endpoint", False, "Missing required fields in response")
            else:
                self.log_test("POST Status Endpoint", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Status Endpoints", False, f"Exception: {str(e)}")

    def test_student_signup(self):
        """Test POST /api/students/signup"""
        try:
            response = self.session.post(f"{API_URL}/students/signup", json=self.test_student_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "student"]
                
                if all(field in data for field in required_fields):
                    self.auth_token = data["access_token"]
                    student_data = data["student"]
                    
                    # Verify student data
                    if (student_data["email"] == self.test_student_data["email"] and
                        student_data["name"] == self.test_student_data["name"]):
                        self.log_test("Student Signup", True, f"Student created with ID: {student_data['id']}")
                        return True
                    else:
                        self.log_test("Student Signup", False, "Student data mismatch")
                else:
                    self.log_test("Student Signup", False, f"Missing fields in response: {data}")
            else:
                self.log_test("Student Signup", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Student Signup", False, f"Exception: {str(e)}")
        
        return False

    def test_duplicate_signup(self):
        """Test duplicate signup prevention"""
        try:
            # Try to signup with same email
            response = self.session.post(f"{API_URL}/students/signup", json=self.test_student_data)
            
            if response.status_code == 400:
                data = response.json()
                if "already exists" in data.get("detail", "").lower():
                    self.log_test("Duplicate Email Prevention", True, "Correctly prevented duplicate email")
                else:
                    self.log_test("Duplicate Email Prevention", False, f"Wrong error message: {data}")
            else:
                self.log_test("Duplicate Email Prevention", False, f"Should return 400, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Duplicate Email Prevention", False, f"Exception: {str(e)}")

    def test_student_login(self):
        """Test POST /api/students/login"""
        try:
            login_data = {
                "email": self.test_student_data["email"],
                "password": self.test_student_data["password"]
            }
            
            response = self.session.post(f"{API_URL}/students/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "student"]
                
                if all(field in data for field in required_fields):
                    # Update auth token
                    self.auth_token = data["access_token"]
                    self.log_test("Student Login", True, "Login successful with valid credentials")
                    return True
                else:
                    self.log_test("Student Login", False, f"Missing fields in response: {data}")
            else:
                self.log_test("Student Login", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Student Login", False, f"Exception: {str(e)}")
        
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            invalid_login = {
                "email": self.test_student_data["email"],
                "password": "wrongpassword"
            }
            
            response = self.session.post(f"{API_URL}/students/login", json=invalid_login)
            
            if response.status_code == 401:
                self.log_test("Invalid Login Prevention", True, "Correctly rejected invalid credentials")
            else:
                self.log_test("Invalid Login Prevention", False, f"Should return 401, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Login Prevention", False, f"Exception: {str(e)}")

    def test_get_profile(self):
        """Test GET /api/students/profile"""
        if not self.auth_token:
            self.log_test("Get Student Profile", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{API_URL}/students/profile", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "email", "phone", "university_name", "student_id"]
                
                if all(field in data for field in required_fields):
                    if data["email"] == self.test_student_data["email"]:
                        self.log_test("Get Student Profile", True, f"Profile retrieved for: {data['name']}")
                        return True
                    else:
                        self.log_test("Get Student Profile", False, "Profile data mismatch")
                else:
                    self.log_test("Get Student Profile", False, f"Missing fields: {data}")
            else:
                self.log_test("Get Student Profile", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get Student Profile", False, f"Exception: {str(e)}")
        
        return False

    def test_unauthorized_profile(self):
        """Test profile access without token"""
        try:
            response = self.session.get(f"{API_URL}/students/profile")
            
            if response.status_code == 403:
                self.log_test("Unauthorized Profile Access", True, "Correctly blocked unauthorized access")
            else:
                self.log_test("Unauthorized Profile Access", False, f"Should return 403, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Unauthorized Profile Access", False, f"Exception: {str(e)}")

    def test_update_profile(self):
        """Test PUT /api/students/profile"""
        if not self.auth_token:
            self.log_test("Update Student Profile", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            update_data = {
                "name": "أحمد محمد علي المحدث",
                "phone": "+966501234999",
                "preferences": {
                    "language": "en",
                    "theme": "dark"
                }
            }
            
            response = self.session.put(f"{API_URL}/students/profile", json=update_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if (data["name"] == update_data["name"] and 
                    data["phone"] == update_data["phone"]):
                    self.log_test("Update Student Profile", True, "Profile updated successfully")
                    return True
                else:
                    self.log_test("Update Student Profile", False, "Profile data not updated correctly")
            else:
                self.log_test("Update Student Profile", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Update Student Profile", False, f"Exception: {str(e)}")
        
        return False

    def test_change_password(self):
        """Test POST /api/students/change-password"""
        if not self.auth_token:
            self.log_test("Change Password", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            new_password = "NewSecurePass456!"
            password_data = {
                "current_password": self.test_student_data["password"],
                "new_password": new_password
            }
            
            response = self.session.post(f"{API_URL}/students/change-password", json=password_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "success" in data["message"].lower():
                    # Update password for future tests
                    self.test_student_data["password"] = new_password
                    self.log_test("Change Password", True, "Password changed successfully")
                    return True
                else:
                    self.log_test("Change Password", False, f"Unexpected response: {data}")
            else:
                self.log_test("Change Password", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Change Password", False, f"Exception: {str(e)}")
        
        return False

    def test_invalid_password_change(self):
        """Test password change with wrong current password"""
        if not self.auth_token:
            self.log_test("Invalid Password Change", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            password_data = {
                "current_password": "wrongcurrentpassword",
                "new_password": "NewPassword123!"
            }
            
            response = self.session.post(f"{API_URL}/students/change-password", json=password_data, headers=headers)
            
            if response.status_code == 400:
                self.log_test("Invalid Password Change", True, "Correctly rejected wrong current password")
            else:
                self.log_test("Invalid Password Change", False, f"Should return 400, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Password Change", False, f"Exception: {str(e)}")

    def test_create_booking(self):
        """Test POST /api/bookings"""
        if not self.auth_token:
            self.log_test("Create Booking", False, "No auth token available")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            booking_data = {
                "tutor_id": str(uuid.uuid4()),
                "subject": "الرياضيات",
                "session_type": "individual",
                "date": "2024-12-25",
                "time": "14:00"
            }
            
            response = self.session.post(f"{API_URL}/bookings", json=booking_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "student_id", "tutor_id", "subject", "session_type", "date", "time", "status"]
                
                if all(field in data for field in required_fields):
                    if (data["subject"] == booking_data["subject"] and 
                        data["status"] == "pending"):
                        self.log_test("Create Booking", True, f"Booking created with ID: {data['id']}")
                        return data["id"]
                    else:
                        self.log_test("Create Booking", False, "Booking data mismatch")
                else:
                    self.log_test("Create Booking", False, f"Missing fields: {data}")
            else:
                self.log_test("Create Booking", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Create Booking", False, f"Exception: {str(e)}")
        
        return None

    def test_get_bookings(self):
        """Test GET /api/bookings"""
        if not self.auth_token:
            self.log_test("Get Student Bookings", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{API_URL}/bookings", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Student Bookings", True, f"Retrieved {len(data)} bookings")
                else:
                    self.log_test("Get Student Bookings", False, "Response is not a list")
            else:
                self.log_test("Get Student Bookings", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get Student Bookings", False, f"Exception: {str(e)}")

    def test_get_specific_booking(self, booking_id):
        """Test GET /api/bookings/{booking_id}"""
        if not self.auth_token or not booking_id:
            self.log_test("Get Specific Booking", False, "No auth token or booking ID available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{API_URL}/bookings/{booking_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data["id"] == booking_id:
                    self.log_test("Get Specific Booking", True, f"Retrieved booking: {booking_id}")
                else:
                    self.log_test("Get Specific Booking", False, "Booking ID mismatch")
            elif response.status_code == 404:
                self.log_test("Get Specific Booking", False, "Booking not found")
            else:
                self.log_test("Get Specific Booking", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get Specific Booking", False, f"Exception: {str(e)}")

    def test_cancel_booking(self, booking_id):
        """Test PUT /api/bookings/{booking_id}/cancel"""
        if not self.auth_token or not booking_id:
            self.log_test("Cancel Booking", False, "No auth token or booking ID available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.put(f"{API_URL}/bookings/{booking_id}/cancel", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "cancel" in data["message"].lower():
                    self.log_test("Cancel Booking", True, f"Booking cancelled: {booking_id}")
                else:
                    self.log_test("Cancel Booking", False, f"Unexpected response: {data}")
            elif response.status_code == 404:
                self.log_test("Cancel Booking", False, "Booking not found")
            else:
                self.log_test("Cancel Booking", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Cancel Booking", False, f"Exception: {str(e)}")

    def test_unauthorized_booking_access(self):
        """Test booking access without token"""
        try:
            response = self.session.get(f"{API_URL}/bookings")
            
            if response.status_code == 403:
                self.log_test("Unauthorized Booking Access", True, "Correctly blocked unauthorized access")
            else:
                self.log_test("Unauthorized Booking Access", False, f"Should return 403, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Unauthorized Booking Access", False, f"Exception: {str(e)}")

    def test_ai_chat_arabic(self):
        """Test AI chat with Arabic message"""
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
                        self.log_test("AI Chat Arabic", True, f"Received Arabic response: {data['response'][:100]}...")
                    else:
                        self.log_test("AI Chat Arabic", False, f"Invalid response data: {data}")
                else:
                    self.log_test("AI Chat Arabic", False, f"Missing fields in response: {data}")
            else:
                self.log_test("AI Chat Arabic", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("AI Chat Arabic", False, f"Exception: {str(e)}")

    def test_ai_chat_english(self):
        """Test AI chat with English message"""
        try:
            chat_data = {
                "message": "What is the best way to study mathematics?",
                "language": "en",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["response", "language"]
                
                if all(field in data for field in required_fields):
                    if (data["language"] == "en" and 
                        len(data["response"]) > 0 and
                        data["response"] != chat_data["message"]):
                        self.log_test("AI Chat English", True, f"Received English response: {data['response'][:100]}...")
                    else:
                        self.log_test("AI Chat English", False, f"Invalid response data: {data}")
                else:
                    self.log_test("AI Chat English", False, f"Missing fields in response: {data}")
            else:
                self.log_test("AI Chat English", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("AI Chat English", False, f"Exception: {str(e)}")

    def test_ai_chat_urdu(self):
        """Test AI chat with Urdu message"""
        try:
            chat_data = {
                "message": "ریاضی پڑھنے کا بہترین طریقہ کیا ہے؟",
                "language": "ur",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["response", "language"]
                
                if all(field in data for field in required_fields):
                    if (data["language"] == "ur" and 
                        len(data["response"]) > 0 and
                        data["response"] != chat_data["message"]):
                        self.log_test("AI Chat Urdu", True, f"Received Urdu response: {data['response'][:100]}...")
                    else:
                        self.log_test("AI Chat Urdu", False, f"Invalid response data: {data}")
                else:
                    self.log_test("AI Chat Urdu", False, f"Missing fields in response: {data}")
            else:
                self.log_test("AI Chat Urdu", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("AI Chat Urdu", False, f"Exception: {str(e)}")

    def test_ai_chat_no_message(self):
        """Test AI chat error case with no message"""
        try:
            chat_data = {
                "language": "ar",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 422:
                self.log_test("AI Chat No Message", True, "Correctly rejected request without message")
            else:
                self.log_test("AI Chat No Message", False, f"Should return 422, got: {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Chat No Message", False, f"Exception: {str(e)}")

    def test_ai_chat_empty_message(self):
        """Test AI chat with empty message"""
        try:
            chat_data = {
                "message": "",
                "language": "ar",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 422:
                self.log_test("AI Chat Empty Message", True, "Correctly rejected empty message")
            elif response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 0:
                    self.log_test("AI Chat Empty Message", True, "Handled empty message gracefully")
                else:
                    self.log_test("AI Chat Empty Message", False, "Empty response for empty message")
            else:
                self.log_test("AI Chat Empty Message", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Chat Empty Message", False, f"Exception: {str(e)}")

    def test_ai_chat_default_language(self):
        """Test AI chat with default language (no language specified)"""
        try:
            chat_data = {
                "message": "What is machine learning?",
                "context": "educational_assistant"
            }
            
            response = self.session.post(f"{API_URL}/ai-chat", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["response", "language"]
                
                if all(field in data for field in required_fields):
                    if (data["language"] == "ar" and  # Default should be Arabic
                        len(data["response"]) > 0):
                        self.log_test("AI Chat Default Language", True, f"Used default language (ar): {data['language']}")
                    else:
                        self.log_test("AI Chat Default Language", False, f"Invalid default language: {data}")
                else:
                    self.log_test("AI Chat Default Language", False, f"Missing fields in response: {data}")
            else:
                self.log_test("AI Chat Default Language", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Chat Default Language", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("STARTING BACKEND API TESTS")
        print("=" * 60)
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_status_endpoints()
        
        # AI Chat tests (no authentication required)
        print("\n--- AI CHAT TESTS ---")
        self.test_ai_chat_arabic()
        self.test_ai_chat_english()
        self.test_ai_chat_urdu()
        self.test_ai_chat_no_message()
        self.test_ai_chat_empty_message()
        self.test_ai_chat_default_language()
        
        # Student authentication tests
        print("\n--- AUTHENTICATION TESTS ---")
        signup_success = self.test_student_signup()
        if signup_success:
            self.test_duplicate_signup()
            login_success = self.test_student_login()
            if login_success:
                self.test_get_profile()
                self.test_update_profile()
                self.test_change_password()
                self.test_invalid_password_change()
                
                # Booking management tests
                print("\n--- BOOKING TESTS ---")
                booking_id = self.test_create_booking()
                self.test_get_bookings()
                if booking_id:
                    self.test_get_specific_booking(booking_id)
                    self.test_cancel_booking(booking_id)
        
        # Security tests
        print("\n--- SECURITY TESTS ---")
        self.test_invalid_login()
        self.test_unauthorized_profile()
        self.test_unauthorized_booking_access()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        print("=" * 60)
        print("TEST RESULTS SUMMARY")
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
        
        print("=" * 60)

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()