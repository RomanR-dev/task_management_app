# 🚀 Task Manager Application

A powerful full-stack task management application with user authentication, task tracking, and calendar integration.

![Task Manager Demo](./docs/assets/demo.gif)

## ✨ Features

- 🔐 User authentication (login/registration)
  - Secure JWT-based authentication
  - Password encryption
  - Remember me functionality
- ✅ Task management 
  - Create, edit, delete tasks
  - Rich text descriptions
  - File attachments
  - Task categories and tags
- ⏰ Task scheduling
  - Set due dates and reminders
  - Recurring tasks
  - Calendar view integration
- 📊 Dashboard & Analytics
  - Task completion metrics
  - Productivity trends
  - Custom reports
- 📱 Responsive Design
  - Works on desktop, tablet and mobile
  - Progressive Web App (PWA) support

## 🛠️ Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</div>

- **Frontend**: 
  - React with TypeScript
  - Tailwind CSS for styling
  - Redux for state management
  - React Query for data fetching
- **Backend**: 
  - Node.js with Express
  - RESTful API architecture
  - WebSocket for real-time updates
- **Database**: 
  - MongoDB for data storage
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - OAuth 2.0 support

## 🐳 Running with Docker

The application can be easily deployed using Docker Compose. Follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/RomanR-dev/task_management_app.git
   cd task_management_app
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB Express: http://localhost:8081

4. To stop the containers:
   ```bash
   docker-compose down
   ```

The Docker setup includes:
- Frontend React container
- Node.js backend container 
- MongoDB container

All services are configured to work together out of the box with proper networking and persistence.