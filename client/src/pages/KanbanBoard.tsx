import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

// Define valid status types
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  tags?: string[];
}

interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<Column[]>([
    { id: 'pending', title: 'Pending', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'completed', title: 'Completed', tasks: [] },
    { id: 'overdue', title: 'Overdue', tasks: [] },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper function to validate task status
  const isValidStatus = (status: string): status is TaskStatus => {
    return ['pending', 'in-progress', 'completed', 'overdue'].includes(status);
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/tasks');
      const tasksData = response.data.data.tasks;
      
      // Group tasks by status
      const updatedColumns = columns.map(column => {
        const columnTasks = tasksData
          .filter((task: any) => {
            // Ensure the task has a valid status that matches the column
            return isValidStatus(task.status) && task.status === column.id;
          })
          .map((task: any): Task => ({
            _id: task._id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority as 'low' | 'medium' | 'high',
            status: task.status as TaskStatus,
            tags: task.tags
          }));
          
        return { ...column, tasks: columnTasks };
      });
      
      setColumns(updatedColumns);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { status: newStatus });
      
      // Update local state
      const updatedColumns = columns.map(column => {
        if (column.id === newStatus) {
          // Find the task in its original column
          let taskToMove: Task | undefined;
          
          const columnsWithoutTask = columns.map(col => {
            if (col.id !== newStatus) {
              const taskIndex = col.tasks.findIndex(task => task._id === taskId);
              if (taskIndex !== -1) {
                taskToMove = col.tasks[taskIndex];
                return {
                  ...col,
                  tasks: col.tasks.filter(task => task._id !== taskId)
                };
              }
            }
            return col;
          });
          
          if (taskToMove) {
            return {
              ...column,
              tasks: [...column.tasks, { ...taskToMove, status: newStatus }]
            };
          }
        }
        
        if (column.id !== newStatus) {
          return {
            ...column,
            tasks: column.tasks.filter(task => task._id !== taskId)
          };
        }
        
        return column;
      });
      
      setColumns(updatedColumns);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-blue-500';
      default:
        return '';
    }
  };

  const getColumnBackgroundColor = (columnId: TaskStatus) => {
    switch (columnId) {
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-900';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900';
      case 'overdue':
        return 'bg-red-50 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-slideInLeft">Kanban Board</h1>
        <div className="flex space-x-3 animate-slideInRight">
          <Link
            to="/dashboard"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:scale-105 transform flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Dashboard
          </Link>
          <Link
            to="/tasks/new"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:scale-105 transform flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Task
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className={`rounded-lg shadow-md overflow-hidden ${getColumnBackgroundColor(column.id)}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center">
                  {column.title}
                  <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </h2>
              </div>
              <div className="p-2 min-h-[500px]">
                {column.tasks.map(task => (
                  <div
                    key={task._id}
                    className={`bg-white dark:bg-gray-800 p-3 mb-2 rounded shadow ${getTaskPriorityColor(task.priority)}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <div className="flex space-x-1">
                        {column.id !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'pending')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                            title="Move to Pending"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {column.id !== 'in-progress' && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'in-progress')}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            title="Move to In Progress"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {column.id !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'completed')}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
                            title="Move to Completed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <Link
                          to={`/tasks/edit/${task._id}`}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {task.description && task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {task.tags && task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {column.tasks.length === 0 && (
                  <div className="flex justify-center items-center h-32 text-gray-500 dark:text-gray-400 text-sm">
                    No tasks in this column
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 