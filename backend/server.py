from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import hashlib
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Authentication settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_student(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        student_email: str = payload.get("sub")
        if student_email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    student = await db.students.find_one({"email": student_email})
    if student is None:
        raise credentials_exception
    
    return Student(**student)


# Define Models

# Student Models
class StudentSignup(BaseModel):
    name: str
    phone: str  
    email: EmailStr
    university_name: str
    student_id: str
    password: str

class StudentLogin(BaseModel):
    email: EmailStr
    password: str

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    university_name: str
    student_id: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    preferences: Optional[dict] = {}

class StudentResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    university_name: str
    student_id: str
    created_at: datetime
    preferences: Optional[dict] = {}

class Token(BaseModel):
    access_token: str
    token_type: str
    student: StudentResponse

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Booking Models
class BookingCreate(BaseModel):
    tutor_id: str
    subject: str
    session_type: str  # 'individual' or 'group'
    date: str
    time: str
    
class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    tutor_id: str
    subject: str
    session_type: str
    date: str
    time: str
    status: str = "pending"  # pending, confirmed, rejected, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Original Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Student Authentication Endpoints
@api_router.post("/students/signup", response_model=Token)
async def student_signup(student_signup: StudentSignup):
    # Check if student already exists
    existing_student = await db.students.find_one({"email": student_signup.email})
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Student with this email already exists"
        )
    
    # Check if student ID is already used
    existing_student_id = await db.students.find_one({"student_id": student_signup.student_id})
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Student ID already exists"
        )
    
    # Create new student
    hashed_password = get_password_hash(student_signup.password)
    student_dict = student_signup.dict()
    del student_dict['password']
    student_dict['password_hash'] = hashed_password
    student_dict['preferences'] = {
        'language': 'ar',  # default to Arabic
        'theme': 'light'   # default to light theme
    }
    
    student = Student(**student_dict)
    await db.students.insert_one(student.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": student.email})
    
    # Return token and student info
    student_response = StudentResponse(**student.dict())
    return Token(
        access_token=access_token,
        token_type="bearer",
        student=student_response
    )

@api_router.post("/students/login", response_model=Token)
async def student_login(student_login: StudentLogin):
    student = await db.students.find_one({"email": student_login.email})
    if not student or not verify_password(student_login.password, student["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": student["email"]})
    
    # Return token and student info
    student_response = StudentResponse(**student)
    return Token(
        access_token=access_token,
        token_type="bearer", 
        student=student_response
    )

@api_router.get("/students/profile", response_model=StudentResponse)
async def get_student_profile(current_student: Student = Depends(get_current_student)):
    return StudentResponse(**current_student.dict())

@api_router.put("/students/profile", response_model=StudentResponse)
async def update_student_profile(
    profile_data: dict,
    current_student: Student = Depends(get_current_student)
):
    # Update allowed fields only
    allowed_fields = ['name', 'phone', 'university_name', 'preferences']
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    
    if update_data:
        await db.students.update_one(
            {"email": current_student.email},
            {"$set": update_data}
        )
        
        # Fetch updated student
        updated_student = await db.students.find_one({"email": current_student.email})
        return StudentResponse(**updated_student)
    
    return StudentResponse(**current_student.dict())

@api_router.post("/students/change-password")
async def change_password(
    password_change: PasswordChange,
    current_student: Student = Depends(get_current_student)
):
    # Verify current password
    if not verify_password(password_change.current_password, current_student.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Hash new password and update
    new_password_hash = get_password_hash(password_change.new_password)
    await db.students.update_one(
        {"email": current_student.email},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": "Password changed successfully"}

# Booking Endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(
    booking_data: BookingCreate,
    current_student: Student = Depends(get_current_student)
):
    booking_dict = booking_data.dict()
    booking_dict['student_id'] = current_student.id
    
    booking = Booking(**booking_dict)
    await db.bookings.insert_one(booking.dict())
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_student_bookings(current_student: Student = Depends(get_current_student)):
    bookings = await db.bookings.find({"student_id": current_student.id}).to_list(1000)
    return [Booking(**booking) for booking in bookings]

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(
    booking_id: str,
    current_student: Student = Depends(get_current_student)
):
    booking = await db.bookings.find_one({"id": booking_id, "student_id": current_student.id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**booking)

@api_router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_student: Student = Depends(get_current_student)
):
    result = await db.bookings.update_one(
        {"id": booking_id, "student_id": current_student.id},
        {"$set": {"status": "cancelled"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking cancelled successfully"}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# AI Chat Models
class AIChatRequest(BaseModel):
    message: str
    language: str = "ar"
    context: str = "educational_assistant"

class AIChatResponse(BaseModel):
    response: str
    language: str

# Teacher Models
class TeacherSignup(BaseModel):
    name: str
    phone: str  
    email: EmailStr
    university_name: str
    years_experience: int
    gpa: float
    password: str

class TeacherLogin(BaseModel):
    email: EmailStr
    password: str

class Teacher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    university_name: str
    years_experience: int
    gpa: float
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    preferences: Optional[dict] = {}
    user_type: str = "teacher"

class TeacherResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    university_name: str
    years_experience: int
    gpa: float
    created_at: datetime
    preferences: Optional[dict] = {}
    user_type: str = "teacher"

# Teacher Authentication Endpoints
@api_router.post("/teachers/signup", response_model=Token)
async def teacher_signup(teacher_signup: TeacherSignup):
    # Check if teacher already exists
    existing_teacher = await db.teachers.find_one({"email": teacher_signup.email})
    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Teacher with this email already exists"
        )
    
    # Create new teacher
    hashed_password = get_password_hash(teacher_signup.password)
    teacher_dict = teacher_signup.dict()
    del teacher_dict['password']
    teacher_dict['password_hash'] = hashed_password
    teacher_dict['user_type'] = 'teacher'
    teacher_dict['preferences'] = {
        'language': 'ar',  # default to Arabic
        'theme': 'dark'    # default to dark theme (same as students)
    }
    
    teacher = Teacher(**teacher_dict)
    await db.teachers.insert_one(teacher.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": teacher.email, "user_type": "teacher"})
    
    # Return token and teacher info
    teacher_response = TeacherResponse(**teacher.dict())
    return Token(
        access_token=access_token,
        token_type="bearer",
        student=teacher_response  # Using same structure for compatibility
    )

@api_router.post("/teachers/login", response_model=Token)
async def teacher_login(teacher_login: TeacherLogin):
    teacher = await db.teachers.find_one({"email": teacher_login.email})
    if not teacher or not verify_password(teacher_login.password, teacher["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": teacher["email"], "user_type": "teacher"})
    
    # Return token and teacher info
    teacher_response = TeacherResponse(**teacher)
    return Token(
        access_token=access_token,
        token_type="bearer", 
        student=teacher_response  # Using same structure for compatibility
    )

async def get_current_teacher(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        teacher_email: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        if teacher_email is None or user_type != "teacher":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    teacher = await db.teachers.find_one({"email": teacher_email})
    if teacher is None:
        raise credentials_exception
    
    return Teacher(**teacher)

@api_router.get("/teachers/profile", response_model=TeacherResponse)
async def get_teacher_profile(current_teacher: Teacher = Depends(get_current_teacher)):
    return TeacherResponse(**current_teacher.dict())

# AI Chat endpoint
@api_router.post("/ai-chat", response_model=AIChatResponse)
async def ai_chat(request: AIChatRequest):
    try:
        # Get LLM key from environment
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service is not configured"
            )
        
        # Create system message based on language and context
        system_messages = {
            'ar': {
                'educational_assistant': "أنت مساعد تعليمي ذكي يساعد الطلاب الجامعيين. قدم إجابات مفيدة ودقيقة باللغة العربية، واحرص على أن تكون تفسيراتك واضحة ومفهومة. ساعد في المواد الأكاديمية، والدراسة، وأي أسئلة تعليمية."
            },
            'en': {
                'educational_assistant': "You are an intelligent educational assistant helping university students. Provide helpful and accurate answers in English, and make sure your explanations are clear and understandable. Help with academic subjects, studying, and any educational questions."
            },
            'ur': {
                'educational_assistant': "آپ ایک ذہین تعلیمی اسسٹنٹ ہیں جو یونیورسٹی کے طلباء کی مدد کرتے ہیں۔ اردو میں مفید اور درست جوابات فراہم کریں، اور یقینی بنائیں کہ آپ کی وضاحات واضح اور قابل فہم ہوں۔ تعلیمی مضامین، مطالعہ، اور کسی بھی تعلیمی سوالات میں مدد کریں۔"
            }
        }
        
        # Get system message
        system_message = system_messages.get(request.language, {}).get(
            request.context, 
            system_messages['en']['educational_assistant']
        )
        
        # Initialize LLM Chat
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"student-chat-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        ai_response = await chat.send_message(user_message)
        
        return AIChatResponse(
            response=ai_response,
            language=request.language
        )
        
    except Exception as e:
        logger.error(f"AI Chat Error: {str(e)}")
        
        # Fallback responses based on language
        fallback_responses = {
            'ar': "عذراً، لم أستطع معالجة طلبك في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.",
            'en': "Sorry, I couldn't process your request right now. Please try again later.",
            'ur': "معذرت، میں فی الوقت آپ کی درخواست پر عمل نہیں کر سکا۔ براہ کرم بعد میں دوبارہ کوشش کریں۔"
        }
        
        return AIChatResponse(
            response=fallback_responses.get(request.language, fallback_responses['en']),
            language=request.language
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
