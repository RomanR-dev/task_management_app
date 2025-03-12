const Task = require('../models/taskModel');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, tags, dependencies } = req.body;

    // Validate dependencies if provided
    if (dependencies && dependencies.length > 0) {
      // Check if all dependencies exist
      const dependencyCount = await Task.countDocuments({
        _id: { $in: dependencies },
        user: req.user.id
      });

      if (dependencyCount !== dependencies.length) {
        return res.status(400).json({
          status: 'fail',
          message: 'One or more dependencies do not exist or do not belong to you'
        });
      }
    }

    const newTask = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      tags,
      dependencies,
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        task: newTask
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all tasks for current user
exports.getAllTasks = async (req, res) => {
  try {
    // Build query
    const queryObj = { user: req.user._id };

    // Filter by status if provided
    if (req.query.status) {
      queryObj.status = req.query.status;
    }

    // Filter by priority if provided
    if (req.query.priority) {
      queryObj.priority = req.query.priority;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      queryObj.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      queryObj.dueDate = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      queryObj.dueDate = { $lte: new Date(req.query.endDate) };
    }

    // Execute query
    const tasks = await Task.find(queryObj).sort({ dueDate: 1 });

    // Send response
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { dependencies } = req.body;

    // Validate dependencies if provided
    if (dependencies && dependencies.length > 0) {
      // Check if all dependencies exist
      const dependencyCount = await Task.countDocuments({
        _id: { $in: dependencies },
        user: req.user.id
      });

      if (dependencyCount !== dependencies.length) {
        return res.status(400).json({
          status: 'fail',
          message: 'One or more dependencies do not exist or do not belong to you'
        });
      }

      // Check for circular dependencies
      const taskId = req.params.id;
      const circularCheck = await checkCircularDependencies(taskId, dependencies);
      if (circularCheck) {
        return res.status(400).json({
          status: 'fail',
          message: 'Circular dependency detected. A task cannot depend on itself directly or indirectly.'
        });
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get overdue tasks
exports.getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    }).sort({ dueDate: 1 });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Helper function to check for circular dependencies
const checkCircularDependencies = async (taskId, dependencies) => {
  // If the task depends on itself directly
  if (dependencies.includes(taskId)) {
    return true;
  }

  // Check for indirect circular dependencies
  const queue = [...dependencies];
  const visited = new Set();

  while (queue.length > 0) {
    const currentDep = queue.shift();
    
    if (visited.has(currentDep)) {
      continue;
    }
    
    visited.add(currentDep);
    
    const task = await Task.findById(currentDep);
    if (!task) continue;
    
    if (task.dependencies && task.dependencies.length > 0) {
      // If any of the dependencies' dependencies include the original task
      if (task.dependencies.some(dep => dep.toString() === taskId)) {
        return true;
      }
      
      // Add the dependencies to the queue for further checking
      queue.push(...task.dependencies.map(dep => dep.toString()));
    }
  }
  
  return false;
}; 