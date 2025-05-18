import React, { useState, useEffect, useCallback, useRef} from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import "../_styles/UpcomingCalendar.css"
import { ChevronLeft, ChevronRight, Edit} from "lucide-react"



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
  locationString: string;
}


const UpcomingCalendar = () => {
  const [viewMode, setViewMode] = useState("Default")
  const [selectedWeek, setSelectedWeek] = useState('');
  const [eventData, setEventData] = useState<{ [date: string]: Event[] }>({});
  const [selectedDate, setSelectedDate] = useState<Event[] | null>(null);
  const [selectedWeekLabel, setSelectedWeekLabel] = useState('');
  const [indexOfWeek, setIndex] = useState(0);
  const [indexOfDay, setDayIndex] = useState(-1);
  const indexRef = useRef(-1);
  const selectedWeekRef = useRef('');
  const selectedWeekLabelRef = useRef('');
  const [firstRender, setFirstRender] = useState(0)
  const [currentMonth, setCurrentMonth] = useState('')
  const [activeTab, setActiveTab] = useState("All")
  const activeTabRef = useRef("All");
  const [listEvents, setListEvents] = useState<Event[]>([])
  const listEventsRef = useRef([])

  const dayNames = [
    { day: "SUN"},
    { day: "MON"},
    { day: "TUE"},
    { day: "WED"},
    { day: "THU"},
    { day: "FRI"},
    { day: "SAT"},
  ]

  const org = useSelector((state: RootState) => ({
    orgId: state.auth.orgId,
    authToken: state.auth.authToken,
    refreshToken: state.auth.refreshToken
  }));

  const handleViewMode = async (mode: string) => {
    setViewMode(mode); 
    setActiveTab("All");
  }

  const handleDateClick = (event: Event[], index: number) => {
    setDayIndex(index)
    setSelectedDate(event);
  };

  const formatDate = useCallback((date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    []
  );

  const formatDateForController = useCallback((date: Date) =>
    date.toISOString().split("T")[0],
    []
  );

  const getUpcomingWeeks = useCallback(() => {
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
      const label = `${formatDate(start)} – ${formatDate(end)}`.toUpperCase();;
      const value = `${start.toISOString()}_${end.toISOString()}`;
      weeks.push({
        label,
        value,
      });
    }
    return weeks;
  }, [formatDate]);

  const getNextWeek = async (up: boolean) => {
    if (up) {
      setIndex(indexOfWeek+1);
      indexRef.current = indexOfWeek + 1;
      const [startISO, endISO] = selectedWeekRef.current.split('_');
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);
      startDate.setDate(startDate.getDate() + 7);
      endDate.setDate(endDate.getDate() + 7);
      selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
      selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
      setSelectedWeekLabel(selectedWeekLabelRef.current);
      setSelectedWeek(selectedWeekRef.current);
    }
    else if (!up) {
      setIndex(indexOfWeek-1);
      indexRef.current = indexOfWeek - 1;
      const [startISO, endISO] = selectedWeekRef.current.split('_');
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);
      startDate.setDate(startDate.getDate() - 7);
      endDate.setDate(endDate.getDate() - 7);
      selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
      selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
      setSelectedWeekLabel(selectedWeekLabelRef.current);
      setSelectedWeek(selectedWeekRef.current);
    }
    else {return;}
    setEventData({});
    setSelectedDate(null);
    const [start, end] = selectedWeekRef.current.split('_');
    const date = new Date(end);

    const monthYear = date.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    setCurrentMonth(monthYear)
  }
  const resetTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const getNextMonth = async (up: boolean) => {
    const [startISO, endISO] = selectedWeekRef.current.split('_');
    let startDate = new Date(startISO);
    let endDate = new Date(endISO);
    startDate = resetTime(startDate);
    endDate = resetTime(endDate);

    if (up) {
      setIndex(indexOfWeek+1);
      indexRef.current = indexOfWeek + 1;
      const firstOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
      while (!(firstOfMonth >= startDate && firstOfMonth <= endDate)) {
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);
        selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
        selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
      }

    }
    else if (!up) {
      setIndex(indexOfWeek-1);
      indexRef.current = indexOfWeek - 1;
      const firstOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
      while (!(firstOfMonth >= startDate && firstOfMonth <= endDate)) {
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() - 7);
        selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
        selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
      }
    }
    else {return;}
    setSelectedWeekLabel(selectedWeekLabelRef.current);
    setSelectedWeek(selectedWeekRef.current);
    setEventData({});
    setSelectedDate(null);

    const [start, end] = selectedWeekRef.current.split('_');
    const date = new Date(end);
    const monthYear = date.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    setCurrentMonth(monthYear)
  }

  const handleTabClick = async (tab: string) => {
    console.log("In handle tab click: ", tab);
    setActiveTab(tab);
    activeTabRef.current= tab
    setListEvents([]);
    listEventsRef.current = [];
    getAllEvents();

  }

  const getAllEvents = async () => {
    let mylistEvents = {}
    try {
      console.log("In get all events")
      console.log("Active Tab: ", activeTabRef.current)
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/tag/${activeTabRef.current}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${org.authToken}`,
          }
        }
      );
      
      mylistEvents = response.data;
    } catch (error) {
      console.error(`getEventsForWeek: Error fetching all events:`, error);
      setListEvents([]);
    }
    setListEvents(mylistEvents.data);
    listEventsRef.current = mylistEvents.data;
    console.log("List Events: ", listEventsRef.current);
  }

  const getEventsForWeek = async () => {
    if (!selectedWeek) {
      return;
    }
    let week = ''
    if (selectedWeek == '') {
      week = selectedWeekRef.current
    } else {
      week = selectedWeek
    }
    const [startDateString, endDateString] = week.split("_");
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    console.log("Before getEventsForWeek:", week, " ", startDate, " ", endDate);

    const newEventData: { [date: string]: Event[] } = {};

    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
      const formattedDate = formatDate(current);
      const ISODate = formatDateForController(current);

      try {
        const response: AxiosResponse = await axios.get(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/byDay/${ISODate}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`,
            }
          }
        );
        
        newEventData[formattedDate] = response.data;
      } catch (error) {
        console.error(`getEventsForWeek: Error fetching events for ${formattedDate}:`, error);
        newEventData[formattedDate] = [];
      }
    }
    setEventData(newEventData);
    console.log("Date selected: ", formatDate(startDate), " Event Data: ", newEventData[formatDate(startDate)]);
    if (firstRender == 0) {
      console.log("FIRST ONE")
      const today = formatDate(new Date())
      let index = 0;
      for (const [key] of Object.entries(newEventData)) {
        if (key == today) {
          break;
        }
        index+=1
      }
      console.log("Just eventData and other info:", formatDate(new Date(today)), " ", eventData);
      handleDateClick(newEventData[formatDate(new Date(today))], index);
      setFirstRender(1)
    } else {
    handleDateClick(newEventData[formatDate(startDate)], 0);
    }
  };

  useEffect(() => {
    if (selectedWeek && viewMode == "Calendar") {
      getEventsForWeek();
    }
    else if (viewMode == "Default") {
      getAllEvents();
    } 
    else {
      setEventData({});
      setListEvents([]);
      listEventsRef.current = [];
    }
  }, [selectedWeek, viewMode]);

  useEffect(() =>  {
    if (firstRender == 0) {
    const defaultWeeks = getUpcomingWeeks();
    
    selectedWeekRef.current = defaultWeeks[0].value;
    selectedWeekLabelRef.current = defaultWeeks[0].label;

    setSelectedWeekLabel(defaultWeeks[0].label);
    setSelectedWeek(defaultWeeks[0].value);
    const [start, end] = defaultWeeks[0].value.split('_');
    const date = new Date(end);

    const monthYear = date.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    setCurrentMonth(monthYear)

    console.log("Selected Week: ", selectedWeekRef);
    console.log("Selected Week Label: ", selectedWeekLabelRef);
    getAllEvents();
    getEventsForWeek();
    
    }
  }, [])

  useEffect(()=> {
    setActiveTab("All")
    activeTabRef.current = "All";
    
  }, [viewMode])


  console.log("Component Render: currentMonth:", currentMonth);

  return (
    <div className="events-page">

      <div className = "hero-container">
        <div className = "hero-logo-container">
        <div className="hero-logo"></div>
        </div>
        <div className = "hero-content">
          <div className = "hero-text">
        
            <div className = "hero-title">
                EVENTS
            </div>
            <div className = "hero-subtitle">
                View current, published, past and event drafts
            </div>

          </div>
          <div className = "hero-button-container">
            <div className = "hero-button">
            + CREATE EVENT
            </div>
          </div>
          
        </div>

      </div>
      <div className={`grey-border ${viewMode === "Default" ? "calendar" : ""}`}></div>

      
      

    <div className="calendar-container">
      {viewMode == "Calendar"? 
      <>
      <div className="calendar-header">
        <div className="tags-container">
          {["All", "Drafts"].map((tab) => (
            <button
              key={tab}
              className={`list-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className = "view-container">
                <div className="view-text-container">
                  <div className = "view-text" >VIEW</div>
                </div>
                <button
                  className={`view-tab ${viewMode === "Default" ? "active" : ""}`}
                  onClick={() => {handleViewMode("Default")}}
                >
                  Default
                </button>
                <button
                  className={`view-tab ${viewMode === "Calendar" ? "active" : ""}`}
                  onClick={() => {handleViewMode("Calendar")}}
                >
                  Calendar
                </button>
        </div>
      </div>
      <div className = "calendar-body">
      <div className="calendar-navigation">
        <button className="nav-button" onClick={() => getNextMonth(false)}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="month-title">{currentMonth}</h2>
        <button className="nav-button" onClick={() => getNextMonth(true)}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Days */}
      
      <div className="calendar-days">
      <button className="nav-button" onClick = {() => getNextWeek(false)}>
      <ChevronLeft size={16} onClick = {() => getNextWeek(true)}/>
        </button>
        <div className="calendar-grid">
          {/* Day names row */}
          <div className="days-row">
            {dayNames.map((day, index) => (
              <div key={index} className="day-name">
                {day.day}
              </div>
            ))}
          </div>

          {/* Dates row */}
          <div className="dates-row">
          {Object.keys(eventData).length === 0 ? (
                <p></p>
              ) : (
                Object.entries(eventData).map(([date, events], index) => (
                  <div key={date} className="date-column">
                    <button
                      className={`day-number-container ${index == indexOfDay ? "highlighted" : ""}`}
                      onClick={() => handleDateClick(events, index)}
                    >
                      <div className={`day-number ${date.split(" ")[0] == currentMonth.split(" ")[0].slice(0, 3) ? "samemonth" : ""}`} >
                      {(date[date.length - 2] >= '0' && date[date.length - 2] <= '9')
                        ? (date[date.length - 2] + date[date.length - 1])
                        : date[date.length - 1]}
                      </div>
                      <div className="day-dots">
                      <p>{ 
                      events.length >= 3 
                        ? "•••" 
                        : events.length >= 1 
                          ? "•" 
                          : <span style={{ visibility: 'hidden' }}>.</span> 
                    }</p>
                    </div>
                    </button>
                    
                  </div>
                ))
              )}
              </div>
        </div>
        <button className="nav-button">
          <ChevronRight size={16} onClick = {() => getNextWeek(true)}/>
        </button>
        
      </div>
      {/* Events List */}
      <div className="list-group-container current">
              {selectedDate === null ? (
                  <p>Loading...</p>
                ) : selectedDate.length === 0 ? (
                  <p>No events on this day</p>
                ) : (
                selectedDate.map((event) => (
                  <div key={event._id} className="current-item-container">
                    <div className="event-image">
                      <img src={event.image || "/placeholder.svg"} alt="Event" />
                    </div>
                    <div className="event-details-container">
                      <h3 className="event-title">{event.name}</h3>
                      <div className="event-info">
                              <span className="event-date">
                                {event.date != null
                                  ? new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }).toUpperCase()
                                  : "No date"}
                              </span>
                              <span className="event-separator">|</span>
                              <span className="event-time">
                                {event.date != null
                                  ? new Date(event.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  : "No time"}
                              </span>
                              <div className="event-location">
                                {event.locationString == "" ? "No location specified" : event.locationString}
                              </div>
                              <div className = "attend">
                                
                              <div className="attend-image">
                              <img src="/attend.png" alt="Attend" />
                              
                              </div>
                              <div className='text'><div>{event.registeredUsers.length} Attendees</div></div>
                              </div>
                              </div>
                    </div>
                  </div>
                ))
              )}
            </div>
      </div>
      </>: <>
        <div className = "list-container">
            <div className = "list-option-container" >
              <div className = "tags-container">
              {["All", "Current", "Upcoming", "Drafts", "Past" ].map((tab) => (
                <button
                  key={tab}
                  className={`list-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
              </div>
              <div className = "view-container">
                <div className="view-text-container">
                  <div className = "view-text" >VIEW</div>
                </div>
                <button
                  className={`view-tab ${viewMode === "Default" ? "active" : ""}`}
                  onClick={() => {handleViewMode("Default")}}
                >
                  Default
                </button>
                <button
                  className={`view-tab ${viewMode === "Calendar" ? "active" : ""}`}
                  onClick={() => {handleViewMode("Calendar")}}
                >
                  Calendar
                </button>
              </div>
            </div>
            <div className = "list-current-container">
              
              {listEventsRef.current.length == 0 ? (
              <p>No events found</p>
            ) : (
              
              Object.entries(listEventsRef.current).map(([groupName, events]) => (
                <div key={groupName} >
                  <div className = "event-header"> 
                    <div className = "current-title">{`${groupName.toUpperCase()} EVENTS`}</div>
                    <div className = "event-count">{`${listEventsRef.current[groupName].length}`}</div>
                  </div>
                  <div   className={`list-group-container ${groupName.toLowerCase()}`}>
                  {events.map((event: Event, index) => {
                    if (groupName === "Current") {
                      return (
                        <div key={event.id || index} className="current-item-container">
                          <div className="event-image">
                            <img src={event.image || "/placeholder.svg"} alt="Event" />
                          </div>
                          <div className = "event-details-container">
                            <h3 className="event-title">{event.name.toUpperCase()}</h3>
                            <div className="event-info">
                              <span className="event-date">
                                {event.date != null
                                  ? new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }).toUpperCase()
                                  : "No date"}
                              </span>
                              <span className="event-separator">|</span>
                              <span className="event-time">
                                {event.date != null
                                  ? new Date(event.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  : "No time"}
                              </span>
                              </div>
                              <div className="event-location">
                                {event.locationString == "" ? "No location specified" : event.locationString}
                              </div>
                              <div className = "attend">
                                
                              <div className="attend-image">
                              <img src="/attend.png" alt="Attend" />
                              
                              </div>
                              <div className='text'><div>{event.registeredUsers.length} Attendees</div></div>
                              </div>
                            </div>
                        </div>
                      );
                    } else if (groupName === "Past") {
                      return (
                        <div key={event._id} className="event-item past-event">
                          <div className="event-details">
                            <h3 className="event-title">{event.name}</h3>
                            <span className="event-separator">•</span>
                            <div className="event-info-past">
                              <span className="event-date">
                                {event.date != null
                                  ? new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }).toUpperCase()
                                  : "No date"}
                              </span>
                              <span className="event-separator">|</span>
                              <span className="event-time">
                                {event.date != null
                                  ? new Date(event.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  : "No time"}
                              </span>
                              <span className="event-location">
                                {event.locationString == null ? "No location specified" : event.locationString}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (groupName === "Upcoming") {
                      return (
                        <div key={event._id} className="current-item-container">
                          <div className="event-image">
                            <img src={event.image || "/placeholder.svg"} alt="Event" />
                          </div>
                          <div className = "event-details-container">
                            <h3 className="event-title">{event.name}</h3>
                            <div className="event-info">
                              <span className="event-date">
                                {event.date != null
                                  ? new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }).toUpperCase()
                                  : "No date"}
                              </span>
                              <span className="event-separator">|</span>
                              <span className="event-time">
                                {event.date != null
                                  ? new Date(event.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  : "No time"}
                              </span>
                              
                              </div>
                              <div className="event-location">
                                {event.locationString == "" ? "No location specified" : event.locationString}
                              </div>
                              <div className = "attend">
                                
                              <div className="attend-image">
                              <img src="/attend.png" alt="Attend" />
                              
                              </div>
                              <div className='text'><div>{event.registeredUsers.length} Attendees</div></div>
                              </div>
                            </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={event._id} className="event-item">
                          <div className="event-details">
                            <h3 className="event-title">{event.name}</h3>
                            <span className="event-separator">•</span>
                            <div className="event-info">
                              <span className="event-date">
                                {event.date != null
                                  ? new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }).toUpperCase()
                                  : "No date"}
                              </span>
                              <span className="event-separator">|</span>
                              <span className="event-time">
                                {event.date != null
                                  ? new Date(event.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  : "No time"}
                              </span>
                              <span className="event-separator">•</span>
                              <span className="event-location">
                                {event.locationString == null ? "No location specified" : event.locationString}
                              </span>
                            </div>
                          </div>
                          <div className="edit-right-aligned">
                            <button className="edit-button">
                              <Edit size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
                </div>
              ))
              
            )}
                <div className = "current-item"></div>
            </div>

        </div>
      
      </>
      }
    </div>
    </div>
  );
};

export default UpcomingCalendar;
