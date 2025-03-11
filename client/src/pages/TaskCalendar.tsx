import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/api.ts';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
}

const TaskCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Convert tasks to calendar events
    const calendarEvents = tasks.map((task) => {
      const dueDate = new Date(task.dueDate);
      return {
        id: task._id,
        title: task.title,
        start: dueDate,
        end: dueDate,
        allDay: true,
        resource: task,
      };
    });
    setEvents(calendarEvents);
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

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/tasks/edit/${event.id}`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const { priority, status } = event.resource;
    
    let backgroundColor = '#3788d8'; // Default blue
    
    // Set color based on priority
    if (priority === 'high') {
      backgroundColor = '#e53e3e'; // Red for high priority
    } else if (priority === 'medium') {
      backgroundColor = '#ed8936'; // Orange for medium priority
    } else if (priority === 'low') {
      backgroundColor = '#38a169'; // Green for low priority
    }
    
    // If completed, make it more muted
    if (status === 'completed') {
      backgroundColor = '#718096'; // Gray for completed
    }
    
    // If overdue, make it more prominent
    if (status === 'overdue') {
      backgroundColor = '#9b2c2c'; // Dark red for overdue
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: status === 'completed' ? 0.6 : 0.8,
        color: '#fff',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Calendar</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center"
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
          <button
            onClick={() => navigate('/tasks/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-96 md:h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              popup
              selectable
              onSelectSlot={(slotInfo) => {
                // Navigate to new task form with the selected date pre-filled
                const selectedDate = moment(slotInfo.start).format('YYYY-MM-DD');
                navigate(`/tasks/new?date=${selectedDate}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar; 