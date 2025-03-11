const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirm: 'password123'
};

// Function to register a user
async function registerUser() {
  try {
    console.log('Registering user...');
    console.log('Request data:', testUser);
    const response = await axios.post(`${API_URL}/api/users/register`, testUser);
    console.log('Registration successful!');
    console.log('Response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      // If user already exists, try logging in
      if (error.response.data.message && error.response.data.message.includes('already exists')) {
        return loginUser();
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to login a user
async function loginUser() {
  try {
    console.log('Logging in...');
    console.log('Request data:', { email: testUser.email, password: testUser.password });
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful!');
    console.log('Response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to create a task
async function createTask(token) {
  try {
    console.log('Creating task...');
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      priority: 'medium',
      status: 'pending'
    };
    console.log('Request data:', taskData);
    const response = await axios.post(
      `${API_URL}/api/tasks`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('Task created successfully!');
    console.log('Response:', response.data);
    return response.data.data.task._id;
  } catch (error) {
    console.error('Task creation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to get all tasks
async function getAllTasks(token) {
  try {
    console.log('Fetching all tasks...');
    const response = await axios.get(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Tasks fetched successfully!');
    console.log('Response:', response.data);
    return response.data.data.tasks;
  } catch (error) {
    console.error('Fetching tasks failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to get overdue tasks
async function getOverdueTasks(token) {
  try {
    console.log('Fetching overdue tasks...');
    const response = await axios.get(`${API_URL}/api/tasks/overdue/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Overdue tasks fetched successfully!');
    console.log('Response:', response.data);
    return response.data.data.tasks;
  } catch (error) {
    console.error('Fetching overdue tasks failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Main function to run all tests
async function runTests() {
  try {
    // Register or login
    console.log('=== Testing Authentication ===');
    const token = await registerUser() || await loginUser();
    if (!token) {
      console.error('Could not get authentication token. Exiting...');
      return;
    }
    console.log('Authentication successful with token:', token);

    // Create a task
    console.log('\n=== Testing Task Creation ===');
    const taskId = await createTask(token);
    if (!taskId) {
      console.error('Could not create task. Exiting...');
      return;
    }
    console.log('Task created with ID:', taskId);

    // Get all tasks
    console.log('\n=== Testing Get All Tasks ===');
    await getAllTasks(token);

    // Get overdue tasks
    console.log('\n=== Testing Get Overdue Tasks ===');
    await getOverdueTasks(token);

    console.log('\n=== All tests completed! ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests(); 