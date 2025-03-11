import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/api.ts';

// Add global styles for dark mode inputs
const darkModeInputStyles = `
  .dark input, .dark select, .dark textarea {
    color: white !important;
    background-color: #374151 !important;
    -webkit-text-fill-color: white !important;
  }
  .dark input::placeholder, .dark textarea::placeholder {
    color: #9CA3AF !important;
  }
  .dark input[type="date"] {
    color-scheme: dark;
  }
  .dark input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
  .dark select option {
    background-color: #374151 !important;
    color: white !important;
  }
  /* Force WebKit browsers to show text in dark mode */
  .dark input:-webkit-autofill,
  .dark input:-webkit-autofill:hover,
  .dark input:-webkit-autofill:focus,
  .dark textarea:-webkit-autofill,
  .dark textarea:-webkit-autofill:hover,
  .dark textarea:-webkit-autofill:focus,
  .dark select:-webkit-autofill,
  .dark select:-webkit-autofill:hover,
  .dark select:-webkit-autofill:focus {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0px 1000px #374151 inset !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/tasks/${id}`);
      const task = response.data.data.task;
      
      // Format date to YYYY-MM-DD for input
      const formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
      
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('dueDate', formattedDate);
      setValue('priority', task.priority);
      setValue('status', task.status);
    } catch (error) {
      toast.error('Failed to fetch task details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      
      if (id) {
        await api.patch(`/api/tasks/${id}`, data);
        toast.success('Task updated successfully');
      } else {
        await api.post('/api/tasks', data);
        toast.success('Task created successfully');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-slideInUp">
      {/* Add style tag for dark mode inputs */}
      <style>{darkModeInputStyles}</style>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{id ? 'Edit Task' : 'Create New Task'}</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md flex items-center transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-dark-card p-6 transition-colors duration-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline mr-2 text-primary-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Task Title
            </label>
            <input
              id="title"
              type="text"
              className={`w-full px-3 py-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 transition-colors duration-200`}
              placeholder="Enter task title"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 100,
                  message: 'Title cannot exceed 100 characters',
                },
              })}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full px-3 py-2 border ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 transition-colors duration-200`}
              placeholder="Enter task description (optional)"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters',
                },
              })}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="dueDate">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline mr-2 text-primary-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className={`w-full px-3 py-2 border ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
              {...register('dueDate', {
                required: 'Due date is required',
              })}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="priority">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline mr-2 text-primary-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                  clipRule="evenodd"
                />
              </svg>
              Priority
            </label>
            <select
              id="priority"
              className={`w-full px-3 py-2 border ${
                errors.priority ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
              {...register('priority', {
                required: 'Priority is required',
              })}
            >
              <option value="low" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Low</option>
              <option value="medium" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Medium</option>
              <option value="high" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">High</option>
            </select>
            {errors.priority && (
              <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>
            )}
          </div>

          {id && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className={`w-full px-3 py-2 border ${
                  errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
                {...register('status', {
                  required: 'Status is required',
                })}
              >
                <option value="pending" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Pending</option>
                <option value="in-progress" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">In Progress</option>
                <option value="completed" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Completed</option>
                <option value="overdue" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Overdue</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md mr-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition-colors duration-200 shadow-sm hover:shadow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {id ? 'Update Task' : 'Save Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 