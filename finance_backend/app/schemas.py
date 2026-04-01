from pydantic import BaseModel
from typing import Optional

# --- USER SCHEMAS ---

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    status: str

    class Config:
        from_attributes = True


# --- FINANCE RECORD SCHEMAS ---

class RecordCreate(BaseModel):
    amount: float
    record_type: str  # income or expense
    category: str
    date: str
    description: Optional[str] = None
    # 🔥 FIX: Remove owner_id from here or make it Optional so the API doesn't complain
    owner_id: Optional[int] = None  

class RecordResponse(BaseModel):
    id: int
    amount: float
    record_type: str
    category: str
    date: str
    description: str
    owner_id: int

    class Config:
        from_attributes = True

# NEW: Schema for updating a record. 
# 'Optional' means the user doesn't have to provide every field if they just want to change one thing.
class RecordUpdate(BaseModel):
    amount: Optional[float] = None
    record_type: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


# --- DASHBOARD SCHEMA ---

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float