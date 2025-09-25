# ================================================================
# ENHANCED MY POCKET TUTOR BACKEND - إضافة للـ server.py الموجود
# ================================================================

# إضافة هذا الكود إلى server.py الموجود بعد الـ imports الحالية

# ===== المودلز المحسنة =====
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

class UserType(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class SessionType(str, Enum):
    INDIVIDUAL = "individual"
    GROUP = "group"

class SessionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class NotificationType(str, Enum):
    BOOKING_CONFIRMED = "booking_confirmed"
    SESSION_REMINDER = "session_reminder"
    NEW_MESSAGE = "new_message"
    RATING_RECEIVED = "rating_received"

# ===== نماذج التقييمات =====
class RatingCreate(BaseModel):
    teacher_id: str = Field(..., description="معرف المعلم")
    session_id: str = Field(..., description="معرف الجلسة")
    rating: int = Field(..., ge=1, le=5, description="التقييم من 1 إلى 5")
    comment: Optional[str] = Field(None, max_length=500, description="تعليق اختياري")

class Rating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    teacher_id: str
    session_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RatingResponse(BaseModel):
    id: str
    student_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime

# ===== نماذج الجلسات المحسنة =====
class SessionCreate(BaseModel):
    teacher_id: str = Field(..., description="معرف المعلم")
    subject: str = Field(..., min_length=2, max_length=100, description="المادة")
    session_type: SessionType = Field(..., description="نوع الجلسة")
    date: str = Field(..., description="تاريخ الجلسة YYYY-MM-DD")
    time: str = Field(..., description="وقت الجلسة HH:MM")
    duration: int = Field(60, ge=30, le=180, description="مدة الجلسة بالدقائق")
    max_students: Optional[int] = Field(1, ge=1, le=10, description="عدد الطلاب الأقصى")
    price: float = Field(..., ge=0, description="السعر")
    notes: Optional[str] = Field(None, max_length=1000, description="ملاحظات")

class Session(SessionCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    status: SessionStatus = SessionStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

# ===== نماذج الإشعارات =====
class NotificationCreate(BaseModel):
    user_id: str
    user_type: UserType
    notification_type: NotificationType
    title: Dict[str, str] = Field(..., description="العنوان بالغات المختلفة")
    message: Dict[str, str] = Field(..., description="الرسالة بالغات المختلفة")
    data: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")

class Notification(NotificationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ===== نماذج الرسائل المحسنة =====
class MessageCreate(BaseModel):
    receiver_id: str = Field(..., description="معرف المستقبل")
    receiver_type: UserType = Field(..., description="نوع المستقبل")
    message: str = Field(..., min_length=1, max_length=1000, description="نص الرسالة")
    message_type: str = Field("text", description="نوع الرسالة")

class Message(MessageCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_type: UserType
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ===== دوال المساعدة المحسنة =====
async def get_user_by_id_and_type(user_id: str, user_type: UserType):
    """جلب المستخدم حسب النوع والمعرف"""
    collection = db.students if user_type == UserType.STUDENT else db.teachers
    return await collection.find_one({"id": user_id})

async def create_notification(notification_data: NotificationCreate):
    """إنشاء إشعار جديد"""
    notification = Notification(**notification_data.dict())
    await db.notifications.insert_one(notification.dict())
    return notification

async def send_push_notification(user_id: str, title: str, message: str, data: dict = None):
    """إرسال إشعار push (يحتاج تكامل مع خدمة إشعارات)"""
    # هنا يمكن تكامل مع Firebase أو خدمة أخرى
    pass

# ===== API التقييمات =====
@api_router.post("/ratings", response_model=Rating)
async def create_rating(
    rating_data: RatingCreate,
    current_user: dict = Depends(get_current_student)
):
    """إنشاء تقييم جديد للمعلم"""
    # التحقق من وجود الجلسة
    session = await db.sessions.find_one({
        "id": rating_data.session_id,
        "student_id": current_user["id"],
        "status": SessionStatus.COMPLETED
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or not completed"
        )
    
    # التحقق من عدم وجود تقييم سابق
    existing_rating = await db.ratings.find_one({
        "student_id": current_user["id"],
        "session_id": rating_data.session_id
    })
    
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating already exists for this session"
        )
    
    # إنشاء التقييم
    rating_dict = rating_data.dict()
    rating_dict["student_id"] = current_user["id"]
    rating = Rating(**rating_dict)
    
    await db.ratings.insert_one(rating.dict())
    
    # إنشاء إشعار للمعلم
    await create_notification(NotificationCreate(
        user_id=rating_data.teacher_id,
        user_type=UserType.TEACHER,
        notification_type=NotificationType.RATING_RECEIVED,
        title={
            "ar": "تقييم جديد",
            "en": "New Rating",
            "ur": "نئی درجہ بندی"
        },
        message={
            "ar": f"حصلت على تقييم {rating.rating} نجوم من {current_user['name']}",
            "en": f"You received {rating.rating} stars rating from {current_user['name']}",
            "ur": f"آپ کو {current_user['name']} سے {rating.rating} ستارے کی درجه بندی ملی"
        },
        data={"rating_id": rating.id, "session_id": rating_data.session_id}
    ))
    
    return rating

@api_router.get("/teachers/{teacher_id}/ratings", response_model=List[RatingResponse])
async def get_teacher_ratings(teacher_id: str):
    """جلب تقييمات المعلم"""
    ratings = await db.ratings.find({"teacher_id": teacher_id}).to_list(100)
    
    result = []
    for rating in ratings:
        # جلب معلومات الطالب
        student = await db.students.find_one({"id": rating["student_id"]})
        student_name = student["name"] if student else "طالب"
        
        result.append(RatingResponse(
            id=rating["id"],
            student_name=student_name,
            rating=rating["rating"],
            comment=rating.get("comment"),
            created_at=rating["created_at"]
        ))
    
    return result

@api_router.get("/teachers/{teacher_id}/rating-stats")
async def get_teacher_rating_stats(teacher_id: str):
    """إحصائيات تقييمات المعلم"""
    ratings = await db.ratings.find({"teacher_id": teacher_id}).to_list(1000)
    
    if not ratings:
        return {
            "average_rating": 0,
            "total_ratings": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total_ratings = len(ratings)
    average_rating = sum(r["rating"] for r in ratings) / total_ratings
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in ratings:
        distribution[rating["rating"]] += 1
    
    return {
        "average_rating": round(average_rating, 2),
        "total_ratings": total_ratings,
        "rating_distribution": distribution
    }

# ===== API الجلسات المحسنة =====
@api_router.post("/sessions", response_model=Session)
async def create_session(
    session_data: SessionCreate,
    current_user: dict = Depends(get_current_student)
):
    """حجز جلسة جديدة"""
    # التحقق من وجود المعلم
    teacher = await db.teachers.find_one({"id": session_data.teacher_id})
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    # إنشاء الجلسة
    session_dict = session_data.dict()
    session_dict["student_id"] = current_user["id"]
    session = Session(**session_dict)
    
    await db.sessions.insert_one(session.dict())
    
    # إنشاء إشعار للمعلم
    await create_notification(NotificationCreate(
        user_id=session_data.teacher_id,
        user_type=UserType.TEACHER,
        notification_type=NotificationType.BOOKING_CONFIRMED,
        title={
            "ar": "حجز جلسة جديدة",
            "en": "New Session Booking",
            "ur": "نیا سیشن بکنگ"
        },
        message={
            "ar": f"طالب جديد {current_user['name']} حجز جلسة معك",
            "en": f"New student {current_user['name']} booked a session with you",
            "ur": f"نیا طالب {current_user['name']} نے آپ کے ساتھ سیشن بک کیا"
        },
        data={"session_id": session.id}
    ))
    
    return session

@api_router.get("/sessions/my-sessions", response_model=List[Session])
async def get_my_sessions(current_user: dict = Depends(get_current_user)):
    """جلب جلسات المستخدم"""
    if current_user.get("user_type") == "student":
        sessions = await db.sessions.find({"student_id": current_user["id"]}).to_list(100)
    else:
        sessions = await db.sessions.find({"teacher_id": current_user["id"]}).to_list(100)
    
    return [Session(**session) for session in sessions]

@api_router.put("/sessions/{session_id}/status")
async def update_session_status(
    session_id: str,
    status: SessionStatus,
    current_user: dict = Depends(get_current_user)
):
    """تحديث حالة الجلسة"""
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # التحقق من الصلاحية
    user_type = current_user.get("user_type")
    if user_type == "student" and session["student_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif user_type == "teacher" and session["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # تحديث الحالة
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Session status updated successfully"}

# ===== API الرسائل المحسنة =====
@api_router.post("/messages", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """إرسال رسالة"""
    # إنشاء الرسالة
    message_dict = message_data.dict()
    message_dict["sender_id"] = current_user["id"]
    message_dict["sender_type"] = UserType(current_user.get("user_type", "student"))
    
    message = Message(**message_dict)
    await db.messages.insert_one(message.dict())
    
    # إنشاء إشعار للمستقبل
    await create_notification(NotificationCreate(
        user_id=message_data.receiver_id,
        user_type=message_data.receiver_type,
        notification_type=NotificationType.NEW_MESSAGE,
        title={
            "ar": "رسالة جديدة",
            "en": "New Message",
            "ur": "نیا پیغام"
        },
        message={
            "ar": f"رسالة جديدة من {current_user['name']}",
            "en": f"New message from {current_user['name']}",
            "ur": f"{current_user['name']} سے نیا پیغام"
        },
        data={"message_id": message.id}
    ))
    
    return message

@api_router.get("/messages/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """جلب المحادثات"""
    user_id = current_user["id"]
    user_type = UserType(current_user.get("user_type", "student"))
    
    # جلب جميع الرسائل المرتبطة بالمستخدم
    messages = await db.messages.find({
        "$or": [
            {"sender_id": user_id},
            {"receiver_id": user_id}
        ]
    }).sort("created_at", -1).to_list(1000)
    
    # تجميع المحادثات
    conversations = {}
    for message in messages:
        other_user_id = message["receiver_id"] if message["sender_id"] == user_id else message["sender_id"]
        
        if other_user_id not in conversations:
            conversations[other_user_id] = {
                "user_id": other_user_id,
                "messages": [],
                "last_message": message,
                "unread_count": 0
            }
        
        conversations[other_user_id]["messages"].append(message)
        
        # حساب الرسائل غير المقروءة
        if message["receiver_id"] == user_id and not message["is_read"]:
            conversations[other_user_id]["unread_count"] += 1
    
    return list(conversations.values())

# ===== API الإشعارات =====
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """جلب إشعارات المستخدم"""
    notifications = await db.notifications.find({
        "user_id": current_user["id"]
    }).sort("created_at", -1).limit(limit).to_list(limit)
    
    return [Notification(**notif) for notif in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """تمييز الإشعار كمقروء"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/mark-all-read")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """تمييز جميع الإشعارات كمقروءة"""
    await db.notifications.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}

# ===== API إحصائيات المعلمين =====
@api_router.get("/teachers/dashboard-stats")
async def get_teacher_dashboard_stats(current_user: dict = Depends(get_current_teacher)):
    """إحصائيات لوحة المعلم"""
    teacher_id = current_user["id"]
    
    # عدد الجلسات
    total_sessions = await db.sessions.count_documents({"teacher_id": teacher_id})
    completed_sessions = await db.sessions.count_documents({
        "teacher_id": teacher_id,
        "status": SessionStatus.COMPLETED
    })
    pending_sessions = await db.sessions.count_documents({
        "teacher_id": teacher_id,
        "status": SessionStatus.PENDING
    })
    
    # عدد الطلاب الفريدين
    sessions = await db.sessions.find({"teacher_id": teacher_id}).to_list(1000)
    unique_students = len(set(session["student_id"] for session in sessions))
    
    # متوسط التقييم
    ratings = await db.ratings.find({"teacher_id": teacher_id}).to_list(1000)
    average_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0
    
    # الإيرادات (تحتاج حساب حسب أسعار الجلسات)
    completed_sessions_data = await db.sessions.find({
        "teacher_id": teacher_id,
        "status": SessionStatus.COMPLETED
    }).to_list(1000)
    total_earnings = sum(session.get("price", 0) for session in completed_sessions_data)
    
    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "pending_sessions": pending_sessions,
        "unique_students": unique_students,
        "average_rating": round(average_rating, 2),
        "total_earnings": total_earnings,
        "total_ratings": len(ratings)
    }

# ===== API البحث والاستكشاف =====
@api_router.get("/teachers/search")
async def search_teachers(
    subject: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    university: Optional[str] = None,
    limit: int = 20
):
    """البحث في المعلمين"""
    query = {"user_type": "teacher", "status": "active"}
    
    if university:
        query["university"] = {"$regex": university, "$options": "i"}
    
    teachers = await db.teachers.find(query).limit(limit).to_list(limit)
    
    # إضافة معلومات التقييم لكل معلم
    result = []
    for teacher in teachers:
        ratings = await db.ratings.find({"teacher_id": teacher["id"]}).to_list(1000)
        avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0
        
        if min_rating and avg_rating < min_rating:
            continue
            
        teacher_data = {
            **teacher,
            "average_rating": round(avg_rating, 2),
            "total_ratings": len(ratings),
            "completed_sessions": await db.sessions.count_documents({
                "teacher_id": teacher["id"],
                "status": SessionStatus.COMPLETED
            })
        }
        result.append(teacher_data)
    
    return result

# ===== تهيئة قاعدة البيانات =====
@app.on_event("startup")
async def create_indexes():
    """إنشاء الفهارس المطلوبة"""
    # فهارس المستخدمين
    await db.students.create_index("email", unique=True)
    await db.teachers.create_index("email", unique=True)
    
    # فهارس الجلسات
    await db.sessions.create_index([("student_id", 1), ("created_at", -1)])
    await db.sessions.create_index([("teacher_id", 1), ("created_at", -1)])
    await db.sessions.create_index("status")
    
    # فهارس التقييمات
    await db.ratings.create_index([("teacher_id", 1), ("created_at", -1)])
    await db.ratings.create_index([("student_id", 1), ("session_id", 1)], unique=True)
    
    # فهارس الرسائل
    await db.messages.create_index([("sender_id", 1), ("created_at", -1)])
    await db.messages.create_index([("receiver_id", 1), ("created_at", -1)])
    
    # فهارس الإشعارات
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await db.notifications.create_index("is_read")
    
    print("✅ Database indexes created successfully")