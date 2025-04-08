import React, { useState } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

interface Event{
  organizerId: "",
  _id: "",
  name: "",
  date: Date | null,
  description: "",
  location: {
      type: "",
      coordinates: [],
  },
  tags: [],
  registeredUsers: [],
  activities: []
}
const UpcomingCalendar = () => {
    const [calendarState, setCalendarState] = useState(0); // 0 - calendar view, 1 - list view
    const [selectedWeek, setSelectedWeek] = useState('');
    const [eventData, setEventData] = useState<{ [date: string]: Event[] }>({});
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    
    
    
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
            console.log("Date: " + start.toISOString())
        }
        console.log(selectedWeek);
        return weeks;
    }
    const weekOptions = getUpcomingWeeks();
    
    const getEventsForWeek = async () => {
      if (!selectedWeek) return; // Exit if no week is selected
    
      const [startDateString, endDateString] = selectedWeek.split("_");
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
    
      try {
        // Loop through each day in the selected week
        for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
          const formattedDate = formatDate(current);
    
          try {
            // Fetch events for the current date using the new endpoint
            const response: AxiosResponse = await axios.post(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/byDay`, 
              {
                date: formattedDate, // Send the date in the body of the request
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${org.authToken}`, // Authorization token
                }
              }
            );
    
            // Update state with the response data for the specific date
            setEventData((prevData) => ({
              ...prevData,
              [formattedDate]: response.data, // Directly assign the response data to the specific date
            }));
          } catch (error) {
            // Handle errors specific to the axios request
            console.error(`Error fetching events for ${formattedDate}:`, error);
            // Optionally, you can store an empty array for that date or handle the error differently
            setEventData((prevData) => ({
              ...prevData,
              [formattedDate]: [], // Optionally set an empty array for that date
            }));
          }
          console.log (eventData[formattedDate]);
        }
      } catch (error) {
        // Handle any general errors that might occur during the process
        console.error("Error fetching events for the week:", error);
      }
    };
    

  return (
    <>
    <h1>Your Upcoming Events</h1>
    <p>Filter By Date</p>
    <select
      id="week-select"
      value={selectedWeek}
      onChange={(e) => setSelectedWeek(e.target.value)}
    >
      <option value="" disabled>
        -- Choose a week --
      </option>
      {weekOptions.map((week, index) => (
        <option key={index} value={week.value}>
          {week.label}
        </option>
      ))}
    </select>
      <p>View</p>
    <button onClick = {getEventsForWeek}>
    Get Events for this Week
    </button>
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