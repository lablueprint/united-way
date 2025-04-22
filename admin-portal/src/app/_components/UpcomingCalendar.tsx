import React, { useState, useRef } from 'react';
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
  const [selectedWeekLabel, setSelectedWeekLabel] = useState('Select Week');
  const selectedWeekRef = useRef(selectedWeek);
  const selectedWeekLabelRef = useRef(selectedWeekLabel);

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
  const formatStartTime = (inputDate: string) => {
    // Extract the time portion from the input string (e.g., "11:09:14 PM")
    const timePart = inputDate.split(', ')[1];  

    // Now we have "11:09:14 PM" and we need to trim the seconds part
    const formattedTime = timePart.split(':')[0] + ':' + timePart.split(':')[1] + ' ' + timePart.split(' ')[1];
    return formattedTime;
  }
    

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
    console.log("In reset selected week: " + week);
    const start = week.split("_")[0];
    const end = week.split("_")[1];
    console.log("WEEK" + week)
    console.log("START: " + start + ", "+ new Date(start));
    console.log("END: " + end + ", " + new Date(end));
    setSelectedWeekLabel(formatDate(new Date(start)) + ' - ' + formatDate(new Date(end)))
    selectedWeekLabelRef.current = formatDate(new Date(start)) + ' - ' + formatDate(new Date(end));
    setSelectedWeek(week);
    selectedWeekRef.current = week;
    console.log("REs:"+ formatDate(new Date(start)) + ' - ' + formatDate(new Date(end)))
    console.log("SELECTEDWEEK" + selectedWeekLabelRef.current)
    const initialEventData = {}; // Define the initial state

    // Reset eventData to the initial state
    setEventData(initialEventData);
    getEventsForWeek();
  };

  const getUpcomingWeeks = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Adjust to the start of the week
  
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(startOfWeek);
      start.setDate(start.getDate() + i * 7); // Move to the start of the ith week
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Move to the end of the week
      weeks.push({
        label: `${formatDate(start)} – ${formatDate(end)}`,
        value: `${start.toISOString()}_${end.toISOString()}`,
      });
    }
    return weeks;
  };
  

  const weekOptions = getUpcomingWeeks();
  //console.log("WEEKOPTIONS: ")
  //console.log(weekOptions)

  const getEventsForWeek = async () => {
    // let newEventData = {};
    if (!selectedWeekRef.current) return; // Exit if no week is selected

    const [startDateString, endDateString] = selectedWeekRef.current.split("_");
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    // Loop through each day in the selected week
    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate()+1)) {
      const formattedDate = formatDate(current);

      try {
        //console.log('Sending in formatted date: ' + current.toISOString());
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
        //console.log("Got the events for " + formattedDate + " and the events are " + eventData[formattedDate]);
      } catch (error) {
        // Handle errors specific to the axios request
        console.error(`Error fetching events for ${formattedDate}:`, error);
        // Optionally, you can store an empty array for that date or handle the error differently
        setEventData((prevData) => ({
          ...prevData,
          [formattedDate]: [], // Optionally set an empty array for that date
        }));
      }
      //console.log(eventData[formattedDate]);
    }
  };

  // const { startDate} = parseSelectedWeek(selectedWeek);
    console.log("SelectedWeekLabel: ", selectedWeekLabel, "SelectedWeek: ", selectedWeek, "EventData: ", eventData);
    return (
      
    <div className = "calendar-container">
      <button onClick={getEventsForWeek}>
        Get Events for this Week
      </button>
      <div className = "calendar-title-container">
      <p className= "calendar-title">Your Upcoming Events</p>
      </div>

      <div className = "calendar-button-container">
      <div></div>
      <div className = "calendar-text-button">
      <p>Filter By Date</p>
      <select
      id="week-select"
      value={selectedWeekLabelRef.current}  
      onChange={(e) => {console.log(e.target.value); setOrResetSelectedWeek(e.target.value);}}
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
    </div>
    <div className = "calendar-text-button">
      <p>View</p>
      <button className = "state-button" onClick={changeState}>
        {calendarState === 0 ? 'Calendar' : 'List'}
      </button>
      </div>
      </div>
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
    <div key={date} >
      {/* Pass the events array for the selected date */}
      <button
  className="calendar-day-button"
  onClick={() => handleDateClick(events)}
>
  {(date[date.length - 2] >= '0' && date[date.length - 2] <= '9')
    ? (date[date.length - 2] + date[date.length - 1])
    : date[date.length - 1]}
</button>
      </div>
  ))
)}
</div>

<div className="scroller-container">
      {selectedDate == null || selectedDate.length === 0 ? (
        <p>No Events on This Day</p>
      ) : (
        selectedDate.map((event) => (
          
          <li key={event._id}>
            <div className = "scroller-item">
            <div 
      style={{
        width: '200px',   // width of the square
        height: '200px',  // height of the square
        backgroundColor: "#C2CBD9"  // background color of the square
      }}
    >
    </div>


            <h3 className='event-title'>{event.name}</h3>
            <p className = 'event-des'>
              {event.description}
            </p>
            <div className = "event-time">
            <p style={{ display: "inline" }} >TODAY | {event.date ? formatStartTime(new Date(event.date).toLocaleString()) : "TBD"}</p>
            </div>
            
            <p className = "event-location">
              {event.location.type} -{" "}
              {event.location.coordinates.length > 0
                ? `(${event.location.coordinates.join(", ")})`
                : " Unspecified"}
            </p>
            
            </div>
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
    </div>
  );
};

export default UpcomingCalendar;