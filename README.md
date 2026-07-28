# AI Resume Matcher Chrome Extension 🚀

An AI-powered Chrome Extension that analyzes resumes against job descriptions and provides ATS compatibility scores, matched skills, missing keywords, and improvement suggestions.

## ✨ Features

- 📄 Upload PDF resumes
- 🤖 AI-powered ATS analysis using Groq LLM
- 📊 ATS compatibility score
- ✅ Matched keywords detection
- ❌ Missing keywords detection
- 💡 AI resume improvement suggestions
- 📈 Modern dashboard UI
- 🎯 Interview probability analysis
- 🧩 Chrome Extension (Manifest V3)
- ⚡ Built with React + Vite + Tailwind CSS

## Tech Stack

Frontend:
- React
- Vite
- Tailwind CSS

Chrome Extension:
- Manifest V3
- Background Service Worker
- Content Scripts

Backend:
- Node.js
- Express.js
- PDF Parser

AI:
- Groq LLM API

## Architecture

User
↓
Chrome Extension
↓
React Popup
↓
Background Service Worker
↓
Express Backend
↓
PDF Parser + Groq AI
↓
ATS Analysis Result

## Setup

Clone repository

Install frontend:

npm install

Install backend:

cd backend
npm install


Create backend/.env

GROQ_API_KEY=your_key

Run backend:

npm start

Run frontend:

npm run dev

## Future Improvements

- Resume improvement suggestions
- Resume rewrite
- Analysis history
- PDF report export
- Authentication
- Dashboard

## Author

Varshith Kummarikunta