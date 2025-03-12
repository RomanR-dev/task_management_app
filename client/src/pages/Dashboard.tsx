import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/api.ts';
import TaskItem from '../components/TaskItem.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  tags?: string[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Extract all unique tags from tasks
    if (tasks.length > 0) {
      const allTags = tasks.reduce((acc: string[], task) => {
        if (task.tags && task.tags.length > 0) {
          return [...acc, ...task.tags];
        }
        return acc;
      }, []);
      
      // Remove duplicates
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);
      console.log('Available tags:', uniqueTags);
      console.log('Tasks with tags:', tasks.filter(task => task.tags && task.tags.length > 0));
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await api.patch(`/api/tasks/${id}`, { status });
      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, status: response.data.data.task.status } : task
        )
      );
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .filter((task) => {
      if (!searchTerm) return true;
      return (
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .filter((task) => {
      if (!tagFilter) return true;
      return task.tags && task.tags.includes(tagFilter);
    });

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setTagFilter('');
  };

  return (
    <div className="transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-slideInLeft">Welcome, {user?.name}</h1>
        <div className="flex space-x-3 animate-slideInRight">
          <Link
            to="/kanban"
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:scale-105 transform flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Kanban
          </Link>
          <Link
            to="/tasks/visualization"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:scale-105 transform flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Visualize
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

      <div className="mb-6 animate-fadeIn animate-delay-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="filter" className="mr-2 font-medium text-gray-700 dark:text-gray-300">
                Status:
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {availableTags.length > 0 && (
              <div>
                <label htmlFor="tagFilter" className="mr-2 font-medium text-gray-700 dark:text-gray-300">
                  Tag:
                </label>
                <select
                  id="tagFilter"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200"
                >
                  <option value="">All Tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {(filter !== 'all' || searchTerm || tagFilter) && (
              <button
                onClick={clearFilters}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 text-sm flex items-center animate-fadeIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded p-2 pl-8 w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <svg
              className="absolute left-2 top-3 h-4 w-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-rotate rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200 animate-popIn">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks found</p>
          <Link
            to="/tasks/new"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded inline-block transition-colors duration-200 hover:scale-105 transform"
          >
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <div key={task._id} className={`animate-fadeIn animate-delay-${Math.min(index * 100, 500)}`}>
              <TaskItem
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;