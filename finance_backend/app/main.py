from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import JWTError, jwt

from app import models, schemas
from app.database import engine, SessionLocal
from app.core.security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM

# This generates the finance.db file
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance AI - Cloud Deployment")

# 🔥 CLOUD DEPLOYMENT CORS CONFIGURATION
# This allows your Vercel frontend to talk to your Render backend safely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401)
    except JWTError: 
        raise HTTPException(status_code=401)
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None: raise HTTPException(status_code=401)
    return user

# --- ROUTES ---

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Exists")
    new_user = models.User(username=user.username, hashed_password=get_password_hash(user.password), role=user.role)
    db.add(new_user)
    db.commit()
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"access_token": create_access_token(data={"sub": user.username}), "token_type": "bearer"}

@app.get("/records")
def get_records(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.FinanceRecord).filter(models.FinanceRecord.owner_id == current_user.id).order_by(models.FinanceRecord.id.desc()).limit(15).all()

@app.post("/records")
def create_record(record: schemas.RecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    data = record.model_dump()
    data["owner_id"] = current_user.id
    new_rec = models.FinanceRecord(**data)
    db.add(new_rec)
    db.commit()
    return new_rec

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cats = db.query(models.FinanceRecord.category, func.sum(models.FinanceRecord.amount)).filter(models.FinanceRecord.owner_id == current_user.id, models.FinanceRecord.record_type == "expense").group_by(models.FinanceRecord.category).all()
    
    trends = db.query(
        func.strftime('%m', models.FinanceRecord.date), 
        func.sum(models.FinanceRecord.amount)
    ).filter(
        models.FinanceRecord.owner_id == current_user.id
    ).group_by(
        func.strftime('%m', models.FinanceRecord.date)
    ).all()
    
    income = db.query(func.sum(models.FinanceRecord.amount)).filter(models.FinanceRecord.owner_id == current_user.id, models.FinanceRecord.record_type == "income").scalar() or 0
    expense = db.query(func.sum(models.FinanceRecord.amount)).filter(models.FinanceRecord.owner_id == current_user.id, models.FinanceRecord.record_type == "expense").scalar() or 0
    
    ratio = (expense / income * 100) if income > 0 else 100
    insight = "Great savings! You are managing your wealth well." if ratio < 50 else "Budget alert: expenses are high compared to income."
    if income == 0: insight = "Add an income record to activate AI insights."
    
    return {
        "category_data": [{"name": c[0], "value": c[1]} for c in cats], 
        "trend_data": [{"month": t[0], "amount": t[1]} for t in trends], 
        "ai_insight": insight
    }

@app.get("/dashboard")
def get_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recs = db.query(models.FinanceRecord).filter(models.FinanceRecord.owner_id == current_user.id).all()
    ti = sum(r.amount for r in recs if r.record_type == "income")
    te = sum(r.amount for r in recs if r.record_type == "expense")
    return {"total_income": ti, "total_expense": te, "net_balance": ti - te}