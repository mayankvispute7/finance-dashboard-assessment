from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# This creates a file named 'finance.db' in our folder to store all data
SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"

# Connect to the database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a 'session' (a temporary workspace to read/write data)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is a base class that our models will inherit from
Base = declarative_base()