# Finance Data Processing & Access Control API

## Overview
This project is a robust, secure backend system designed for a Finance Dashboard. It provides comprehensive APIs for user role management, financial record tracking, and aggregated analytics. Built with **FastAPI**, it emphasizes clean architecture, role-based access control (RBAC), and maintainability. A decoupled **Next.js** frontend is also included to demonstrate the API's real-world integration and data visualization capabilities.

## Features
* **User & Role Management:** Secure user creation with hashed passwords and role assignment (Admin, Analyst, Viewer).
* **Role-Based Access Control (RBAC):** Strict middleware enforcement. Viewers can only read data, Analysts can view records/insights, and Admins have full CRUD capabilities.
* **Financial Records CRUD:** Full management of financial entries (Income/Expense, Categories, Dates, Amounts).
* **Aggregated Dashboard APIs:** Complex SQLAlchemy queries to deliver summary-level data (Net Balance, Category Totals, Monthly Trends) without overburdening the frontend.
* **JWT Authentication:** Stateless, secure token-based authentication.
* **Data Validation:** Pydantic schemas ensure strict input validation and meaningful HTTP error responses.
* **Automated API Docs:** Interactive Swagger UI generated automatically by FastAPI.

## Tech Stack
* **Backend Framework:** FastAPI (Python)
* **Database & ORM:** SQLite + SQLAlchemy
* **Authentication:** JWT (python-jose), Passlib (Bcrypt)
* **Data Validation:** Pydantic
* **Frontend Integration:** Next.js (React), Tailwind CSS, Recharts

## Architecture
The backend follows a layered architecture to ensure separation of concerns:
* `main.py`: Application entry point, CORS configuration, and route definitions.
* `models.py`: SQLAlchemy ORM models defining the database schema.
* `schemas.py`: Pydantic models for request/response validation.
* `database.py`: Database connection and session management.
* `core/security.py`: Password hashing and JWT token generation.

## API Endpoints

### Authentication & Users
* `POST /users`: Create a new user (Requires username, password, role).
* `POST /login`: Authenticate and receive a JWT Bearer token.

### Financial Records
* `GET /records`: Fetch recent financial transactions (Requires Auth).
* `POST /records`: Create a new transaction (Requires Admin/Analyst Role).

### Analytics & Dashboard
* `GET /dashboard`: Returns high-level summaries (Total Income, Total Expense, Net Balance).
* `GET /analytics`: Returns aggregated data for charting (Category grouped sums, Monthly trends) and an AI-driven financial insight string.

## Screenshots
*(Note to Reviewer: The frontend was built to demonstrate the API's capabilities in a real-world scenario.)*

![Dashboard Overview](./screenshots/dashboard.png) 
![Adding a Record](./screenshots/add_record.png)

## Setup Instructions

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and set up the Python environment:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000