import React, { useState } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import './styles.css';

interface Event {
  organizerId: string;
  _id: string;
  name: string;
  date: Date | null;
  description: string;
  location: {
    type: string;
    coordinates: [];
  };
  tags: [];
  registeredUsers: [];
  activities: [];
}

const UpcomingCalendar = () => {
  const [calendarState, setCalendarState] = useState(0); // 0 - calendar view, 1 - list view
  const [selectedWeek, setSelectedWeek] = useState('');
  const [eventData, setEventData] = useState<{ [date: string]: Event[] }>({});
  const [selectedDate, setSelectedDate] = useState<Event[] | null>(null);
  const org = useSelector((state: RootState) => ({
    orgId: state.auth.orgId,
    authToken: state.auth.authToken,
    refreshToken: state.auth.refreshToken
  }));

  const changeState = async () => {
    if (calendarState === 0) setCalendarState(1);
    if (calendarState === 1) setCalendarState(0);
    console.log("SelectedWeek: " + selectedWeek);
  };

  const handleDateClick = (event: Event[]) => {
    setSelectedDate(event);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatDateForController = (date: Date) =>
    date.toISOString().split("T")[0];

  // const parseSelectedWeek = (weekString: string) => {
  //   const [startDateString, endDateString] = weekString.split("_");
  //   const startDate = new Date(startDateString);
  //   const endDate = new Date(endDateString);
  //   return { startDate, endDate };
  // };

  const setOrResetSelectedWeek = (week: string) => {
    setSelectedWeek(week);
    const initialEventData = {}; // Define the initial state

    // Reset eventData to the initial state
    setEventData(initialEventData);
  };

  const getUpcomingWeeks = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weeks = [];
    for (let i = 0; i < 4; i++) {
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
  };

  const weekOptions = getUpcomingWeeks();

  const getEventsForWeek = async () => {
    if (!selectedWeek) return; // Exit if no week is selected

    const [startDateString, endDateString] = selectedWeek.split("_");
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    // Loop through each day in the selected week
    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
      const formattedDate = formatDate(current);

      try {
        console.log('Sending in formatted date: ' + current.toISOString());
        const ISODate = formatDateForController(current);
        // Fetch events for the current date using the new endpoint
        const response: AxiosResponse = await axios.get(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/byDay/${ISODate}`,
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
        console.log("Got the events for " + formattedDate + " and the events are " + eventData[formattedDate]);
      } catch (error) {
        // Handle errors specific to the axios request
        console.error(`Error fetching events for ${formattedDate}:`, error);
        // Optionally, you can store an empty array for that date or handle the error differently
        setEventData((prevData) => ({
          ...prevData,
          [formattedDate]: [], // Optionally set an empty array for that date
        }));
      }
      console.log(eventData[formattedDate]);
    }
  };

  // const { startDate} = parseSelectedWeek(selectedWeek);

    return (
    <>
      <h1>Your Upcoming Events</h1>
      <p>Filter By Date</p>
      <select
      id="week-select"
      value={selectedWeek}
      onChange={(e) => setOrResetSelectedWeek(e.target.value)}
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
      <button onClick={getEventsForWeek}>
        Get Events for this Week
      </button>
      <button onClick={changeState}>
        {calendarState === 0 ? 'Calendar' : 'List'}
      </button>

      {calendarState === 0 ? (
        <> 
        <div className="panel">
        <div className="grid">
            <button>{'<'}</button>
            <div className = "day">SUN</div>
            <div className = "day">MON</div>
            <div className = "day">TUE</div>
            <div className = "day">WED</div>
            <div className = "day">THU</div>
            <div className = "day">FRI</div>
            <div className = "day">SAT</div>
            <button>{'>'}</button>
            <div></div>

          
          {Object.keys(eventData).length === 0 ? (
  <p>Week not selected</p>
) : (
  Object.entries(eventData).map(([date, events]) => (
    <div key={date} className="dates">
      {/* Pass the events array for the selected date */}
      <button onClick={() => handleDateClick(events)}>{date}</button>
    </div>
  ))
)}
</div>

<div className="events">
      {selectedDate == null || selectedDate.length === 0 ? (
        <p>No Events on This Day</p>
      ) : (
        selectedDate.map((event) => (
          <li key={event._id}>
            <h3>{event.name}</h3>
            <p>
              <strong>Date:</strong>{" "}
              {event.date ? new Date(event.date).toLocaleString() : "TBD"}
            </p>
            <p>
              <strong>Description:</strong> {event.description}
            </p>
            <p>
              <strong>Location:</strong> {event.location.type} -{" "}
              {event.location.coordinates.length > 0
                ? `(${event.location.coordinates.join(", ")})`
                : " Unspecified"}
            </p>
            <p>
              <strong>Tags:</strong> {event.tags.join(", ") || "None"}
            </p>
            <p>
              <strong>Registered Users:</strong> {event.registeredUsers.length}
            </p>
          </li>
        ))
      )}
    </div>

        </div>
        </>
      ) : (
        // <div>
        //   {/* List view for displaying events */}
        //   <div className="events-list">
        //     {Object.keys(eventData).map((date) => (
        //       <div key={date}>
        //         <h3>{date}</h3>
        //         <ul>
        //           {eventData[date].map((event) => (
        //             <li key={event._id}>
        //               <h3>{event.name}</h3>
        //             <p><strong>Date:</strong> {event.date ? new Date(event.date).toLocaleString() : "TBD"}</p>
        //             <p><strong>Description:</strong> {event.description}</p>
        //             <p><strong>Location:</strong> {event.location.type} - 
        //               {event.location.coordinates.length > 0
        //                 ? ` (${event.location.coordinates.join(", ")})`
        //                 : " Unspecified"}
        //             </p>
        //             <p><strong>Tags:</strong> {event.tags.join(", ") || "None"}</p>
        //             <p><strong>Registered Users:</strong> {event.registeredUsers.length}</p>
        //             </li>
        //           ))}
        //         </ul>
        //       </div>
        //     ))}
        //   </div>
        // </div>
        <div>Event List</div>
      )}
    </>
  );
};

export default UpcomingCalendar;