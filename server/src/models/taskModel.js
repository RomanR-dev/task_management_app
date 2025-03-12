const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Task title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Task description cannot exceed 500 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags) {
          // Ensure each tag is unique
          return new Set(tags).size === tags.length;
        },
        message: 'Tags must be unique'
      }
    },
    dependencies: {
      type: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
      }],
      default: []
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create index for faster queries
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ tags: 1 }); // Add index for tags for faster filtering
taskSchema.index({ dependencies: 1 }); // Add index for dependencies

// Virtual property to check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'completed' && this.dueDate < new Date();
});

// Pre-save middleware to update status to overdue if past due date
taskSchema.pre('save', function (next) {
  if (this.status !== 'completed' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

// Pre-find middleware to update status to overdue if past due date
// The previous implementation was incorrect - forEach is not available on query objects
taskSchema.pre(/^find/, async function (next) {
  // We can't modify documents during a find query directly
  // Instead, we'll update overdue tasks separately
  const now = new Date();
  await mongoose.model('Task').updateMany(
    {
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    },
    {
      status: 'overdue'
    }
  );
  
  next();
});

// Populate dependencies when finding tasks
taskSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'dependencies',
    select: 'title status'
  });
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 