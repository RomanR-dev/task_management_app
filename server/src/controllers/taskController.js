const Task = require('../models/taskModel');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user._id;

    const newTask = await Task.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
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
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

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