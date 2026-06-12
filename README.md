# School Healthcare Management System with AI Recommendation Engine

## Project Overview

The School Healthcare Management System is a full-stack web application designed to manage student health records, doctor consultations, prescriptions, health alerts, and AI-assisted medical recommendations within a school environment.

The system provides role-based access for:

* Admin
* Doctor
* Nurse
* Parent
* Student

It also includes an AI-powered recommendation engine using OpenRouter + DeepSeek to assist healthcare staff with medicine recommendations based on symptoms, medical history, allergies, and previous diagnoses.

---

# Features

## Authentication & Authorization

* JWT-based authentication
* Role-based access control
* Secure protected routes
* Separate dashboards for different roles

## Student Management

* Add students
* Edit student details
* View student profiles
* Track medical history

## Parent Portal

* View child health information
* View medical records
* Track alerts and updates

## Doctor Module

* Dashboard
* Patient search
* Medical records management
* Prescription management
* AI recommendation support

## Medical Records

* Create records
* View records
* Track diagnoses
* Store prescriptions
* Store doctor notes

## AI Recommendation Engine

* Analyze symptoms
* Review allergies
* Review medical conditions
* Review previous diagnoses
* Suggest medicines
* Suggest medicines to avoid
* Generate urgency level
* Store recommendation history

## Prescription Workflow

Doctor can:

* Generate AI recommendation
* Select recommended medicines
* Add manual medicines
* Save final prescription
* Store prescription in medical records

---

# Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* React Router
* React Icons
* Axios
* React Hot Toast

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## AI

* OpenRouter API
* DeepSeek Chat Model

---

# Project Structure

```text
school-healthcare-system
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   ├── utils
│   │   └── routes
│   │
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# Prerequisites

Install the following before starting:

## Node.js

Download:

https://nodejs.org

Recommended Version:

```bash
Node.js 20+
```

Verify:

```bash
node -v
npm -v
```

---

## MongoDB

Option 1:

Install MongoDB Community Edition

https://www.mongodb.com/try/download/community

Option 2 (Recommended):

Use MongoDB Atlas

https://www.mongodb.com/atlas

---

## VS Code

Download:

https://code.visualstudio.com

Recommended Extensions:

* ESLint
* Prettier
* GitHub Copilot
* MongoDB for VS Code

---

# Cloning the Repository

Open VS Code terminal:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Example:

```bash
git clone https://github.com/USERNAME/school-healthcare-system.git
```

Move into project:

```bash
cd school-healthcare-system
```

Open VS Code:

```bash
code .
```

---

# Frontend Setup

Open terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Default:

```text
http://localhost:5173
```

---

# Backend Setup

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start backend:

```bash
npm run dev
```

Default:

```text
http://localhost:5000
```

---

# Environment Variables

Create:

```text
backend/.env
```

Add:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/school-healthcare

JWT_SECRET=your_jwt_secret_key

OPENROUTER_API_KEY=your_openrouter_api_key
```

---

# OpenRouter AI Setup

## Create Account

https://openrouter.ai

---

## Generate API Key

Dashboard:

```text
Settings
→ Keys
→ Create API Key
```

Copy key.

---

## Add to .env

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
```

---

## Model Used

```text
deepseek/deepseek-chat
```

---

# Database Setup

If using MongoDB Local:

Start MongoDB service.

Verify:

```bash
mongosh
```

Create database automatically when application starts.

Database:

```text
school-healthcare
```

---

# API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

---

## Students

```http
GET /api/students
GET /api/students/:id
POST /api/students
PUT /api/students/:id
DELETE /api/students/:id
```

---

## Medical Records

```http
GET /api/medical-records
GET /api/medical-records/student/:studentId
POST /api/medical-records
```

---

## AI Recommendation

Generate recommendation:

```http
POST /api/ai/recommend
```

Body:

```json
{
  "studentId": "student_mongodb_id",
  "currentSymptoms": "fever, cough"
}
```

---

Get latest recommendation:

```http
GET /api/ai/recommendations/:studentId
```

---

# AI Workflow

Doctor enters symptoms

↓

System loads:

* Student profile
* Allergies
* Medical conditions
* Previous diagnoses

↓

OpenRouter DeepSeek analyzes patient context

↓

Returns:

* Possible condition
* Reasoning
* Recommended medicines
* Medicines to avoid
* Urgency level

↓

Doctor reviews recommendation

↓

Doctor selects medicines

↓

Doctor optionally adds manual medicines

↓

Prescription saved to medical record

---

# Running the Complete System

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Troubleshooting

## MongoDB Connection Error

Check:

```env
MONGO_URI
```

Verify MongoDB service is running.

---

## JWT Errors

Check:

```env
JWT_SECRET
```

---

## AI Not Working

Verify:

```env
OPENROUTER_API_KEY
```

Check OpenRouter account balance.

---

## Port Already In Use

Change:

```env
PORT=5001
```

or kill existing process.

---

# Future Improvements

* Password reset
* Medical record update API
* Medical record delete API
* PDF prescription export
* File upload support
* Email notifications
* SMS alerts
* Advanced analytics
* AI recommendation history dashboard

---

# Contributors

Project Author:

Prajwal

Department of Computer Science and Engineering

---

# License

For educational and academic use only.

This project was developed as part of a School Healthcare Management System academic project.
