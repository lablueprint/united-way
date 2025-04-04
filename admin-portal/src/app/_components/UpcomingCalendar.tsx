import React, {useState} from 'react';
import axios, { AxiosResponse } from "axios";

interface Event {
    name: string; // required field of type String
    date: Date; // required field of type Date
    description: string; // required field of type String
    location: {
      type: 'Point'; // type must be 'Point'
      coordinates: [number, number]; // array of numbers (longitude and latitude)
    };
    organizerID: string; // required field of type String
    tags: string[]; // array of strings
    registeredUsers: string[]; // array of strings
    activity: string[]; // array of strings
  }

const UpcomingCalendar = () => {
    const [calendarState, setCalendarState] = useState(0); // 0 - calendar view, 1 - list view
    const [selectedWeek, setSelectedWeek] = useState('');
    const [events, setEvents] = useState<Event[]>([]);
    
    
    const changeState = async () => {
        if (calendarState == 0)
            setCalendarState(1);
        if (calendarState == 1)
            setCalendarState(0);
    }

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const getUpcomingWeeks = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);

        const weeks = [];
        for (let i = 0; i < 4; i++)
        {
            const start = new Date(startOfWeek);
            start.setDate(start.getDate() + i * 7);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            weeks.push({
                label: `${formatDate(start)} – ${formatDate(end)}`,
                value: `${start.toISOString()}_${end.toISOString()}`,
            });
        }
        
        return weeks;
    }
    const weekOptions = getUpcomingWeeks();

    const getEventsForWeek = async () => {
        console.log("Week options: " + selectedWeek);
        const [startISO, endISO] = weekOptions[0].value.split("_");
        // Format the start and end dates as YYYY-MM-DD for backend
        const startDate = new Date(startISO).toISOString(); // This will preserve the timezone offset in ISO format
        const endDate = new Date(endISO).toISOString();
      
        try {
            console.log(startDate + "  ---  " + endDate);
          const response = await axios.post(
            `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered/`, // Update the endpoint as needed
            { startDate }, // Send the start and end dates for filtering
            { headers: { 'Content-Type': 'application/json' } }
          );
      
          console.log("Events for the week:", response.data);
          return response.data; // Return the filtered events
        } catch (err) {
          console.log("Error fetching events:", err);
          return [];
        }
      };
      

  return (
    <>
    <h1>Your Upcoming Events</h1>
    <p>Filter By Date</p>
    <button onClick = {getEventsForWeek}>Get Event For The Week</button>
    <select
        id="week-select"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      >
        <option value="">-- Choose a week --</option>
        {weekOptions.map((week, index) => (
          <option key={index} value={week.value}>
            {week.label}
          </option>
        ))}
      </select>
      <p>View</p>
      
    <button onClick = {changeState}>
    {calendarState == 0?'Calender':'List'}
    </button>

    {calendarState == 0?
    (<div>
      {}
    </div>):
    (<div>
      
    </div>)}
    </>
  );
};

export default UpcomingCalendar;