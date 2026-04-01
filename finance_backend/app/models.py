from sqlalchemy import Column, Integer, String, Float, ForeignKey

# 🔥 FIX: Added "app." here too!
from app.database import Base

# ... (keep the rest of your models.py code exactly the same)
# The User Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # Roles: admin, analyst, viewer
    status = Column(String, default="active") # Status: active, inactive

# The Finance Record Table
class FinanceRecord(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    record_type = Column(String) # "income" or "expense"
    category = Column(String)
    date = Column(String)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id")) # Links this record to a specific user