import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface TaskItemProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  };
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onStatusChange }) => {
  const { _id, title, description, dueDate, priority, status } = task;
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-blue-500';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = () => {
    const date = new Date(dueDate);
    return format(date, 'MMM d, yyyy');
  };

  const isOverdue = () => {
    return status === 'overdue' || (status !== 'completed' && new Date(dueDate) < new Date());
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  const handleStatusChange = () => {
    const newStatus = status === 'completed' ? 'pending' : 'completed';
    onStatusChange(_id, newStatus);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${getPriorityColor(
        priority
      )} ${status === 'completed' ? 'opacity-70' : ''}`}
    >
      <div className="flex justify-between">
        <div className="flex items-start flex-1">
          <div className="mr-3">
            <button
              onClick={handleStatusChange}
              className={`w-6 h-6 rounded-full border ${
                status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300'
              } flex items-center justify-center focus:outline-none`}
              aria-label={status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {status === 'completed' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-1 ${
                status === 'completed' ? 'line-through text-gray-500' : ''
              }`}
            >
              {title}
            </h3>
            {description && <p className="text-gray-600 mb-2">{description}</p>}
            <div className="flex flex-wrap items-center mt-2 text-sm">
              <span
                className={`px-2 py-1 rounded-full mr-2 ${
                  isOverdue() ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDueDate()}
              </span>
              <span className={`px-2 py-1 rounded-full mr-2 ${getStatusColor(status)}`}>
                {status === 'completed' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {status === 'overdue' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
                {status === 'in-progress' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                )}
                {status === 'pending' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={toggleActions}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Task actions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <Link
                to={`/tasks/edit/${_id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => onDelete(_id)}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 