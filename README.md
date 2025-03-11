# Task Manager Application

A full-stack task management application with user authentication, task tracking, and calendar integration.

## Features

- User authentication (login/registration)
- Task management (add, edit, delete tasks)
- Task scheduling with deadlines
- Overdue task tracking
- Calendar integration

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# To stop all services
docker-compose down
```

This will start:
- MongoDB database on port 27017
- Mongo Express (database admin) on port 8081
- Backend API server on port 5000
- Frontend client on port 3000

Access the application at http://localhost:3000

Access the MongoDB admin interface at http://localhost:8081 (username: admin, password: admin)

## Manual Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## Usage

1. Register a new account or login with existing credentials
2. Add tasks with deadlines
3. View tasks in list view or calendar view
4. Mark tasks as complete
5. Filter tasks by status (all, active, completed, overdue)

## License

MIT 