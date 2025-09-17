import "../_styles/UpcomingCalendar.css";

import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

import { VisibleEventEndMarker } from "./EventEndMarker";

import EventCard from "./EventCard";

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
  const listEventsRef = useRef<Event[]>([])
  const [org, sendRequest] = useApiAuth();
  const router = useRouter();

  const dayNames = [
    { day: "SUN" },
    { day: "MON" },
    { day: "TUE" },
    { day: "WED" },
    { day: "THU" },
    { day: "FRI" },
    { day: "SAT" },
  ]

  const handleMakeEvent = () => {
    router.push('/events/editor');
  };

  const handleViewMode = async (mode: string) => {
    setViewMode(mode);
    setActiveTab("All");
  }

  const handleDateClick = (event: Event[], index: number) => {
    setDayIndex(index)
    setSelectedDate(event);
  };

  const formatDate = useCallback((date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    }),
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

  const getPreviousWeek = async () => {
    setIndex(indexOfWeek - 1);
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

  const getNextWeek = async () => {

    setIndex(indexOfWeek + 1);
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
  const getNextMonth = async () => {
    const [startISO, endISO] = selectedWeekRef.current.split('_');
    let startDate = new Date(startISO);
    let endDate = new Date(endISO);
    startDate = resetTime(startDate);
    endDate = resetTime(endDate);

    setIndex(indexOfWeek + 1);
    indexRef.current = indexOfWeek + 1;
    const firstOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
    while (!(firstOfMonth >= startDate && firstOfMonth <= endDate)) {
      startDate.setDate(startDate.getDate() + 7);
      endDate.setDate(endDate.getDate() + 7);
      selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
      selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
    }
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

  const getPreviousMonth = async () => {
    const [startISO, endISO] = selectedWeekRef.current.split('_');
    let startDate = new Date(startISO);
    let endDate = new Date(endISO);
    startDate = resetTime(startDate);
    endDate = resetTime(endDate);

    setIndex(indexOfWeek - 1);
    indexRef.current = indexOfWeek - 1;
    const firstOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
    while (!(firstOfMonth >= startDate && firstOfMonth <= endDate)) {
      startDate.setDate(startDate.getDate() - 7);
      endDate.setDate(endDate.getDate() - 7);
      selectedWeekLabelRef.current = `${formatDate(startDate)} – ${formatDate(endDate)}`.toUpperCase();;
      selectedWeekRef.current = `${startDate.toISOString()}_${endDate.toISOString()}`;
    }
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
    setActiveTab(tab);
    activeTabRef.current = tab
    setListEvents([]);
    listEventsRef.current = [];
    getAllEvents();

  }

  const getAllEvents = async () => {
    let mylistEvents: Event[] = []
    try {
      const body = {
        orgId: org.orgId
      };
      const requestType = RequestType.POST;
      const endpoint = `events/tag/${activeTabRef.current}`;
      const response = await sendRequest({ body, requestType, endpoint });
      mylistEvents = response;
      setListEvents(mylistEvents);
      listEventsRef.current = mylistEvents;
    } catch (error) {
      console.error(`getEventsForWeek: Error fetching all events:`, error);
      setListEvents([]);
    }
  }

  const getEventsForWeek = async () => {
    if (!selectedWeek) {
      return;
    }
    let week = ''
    if (selectedWeek == '') {
      week = selectedWeekRef.current
    } else {
      week = selectedWeekRef.current
    }
    const [startDateString, endDateString] = week.split("_");
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    const newEventData: { [date: string]: Event[] } = {};

    // TODO: Change this to be one request instead of a for loop of requests.
    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
      const formattedDate = formatDate(current);
      const ISODate = formatDateForController(current);

      try {
        const body = {};
        const requestType = RequestType.GET;
        const endpoint = `events/byDay/${ISODate}`;
        const response = await sendRequest({ body, requestType, endpoint });
        newEventData[formattedDate] = response || [];

      } catch (error) {
        console.error(`getEventsForWeek: Error fetching events for ${formattedDate}:`, error);
        newEventData[formattedDate] = [];
      }
    }
    setEventData(newEventData);
    if (firstRender == 0) {
      const today = formatDate(new Date())
      let index = 0;
      for (const [key] of Object.entries(newEventData)) {
        if (key == today) {
          break;
        }
        index += 1
      }
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

  useEffect(() => {
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
      getAllEvents();
      getEventsForWeek();

    }
  }, [])

  useEffect(() => {
    setActiveTab("All")
    activeTabRef.current = "All";

  }, [viewMode])

  return (
    <div className="events-page">

      <div className="hero-container">
        <div className="hero-logo-container">
          <div className="hero-logo"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">

            <div className="hero-title">
              EVENTS
            </div>
            <div className="hero-subtitle">
              View current, published, past and event drafts
            </div>

          </div>
          <div className="hero-button-container">
            <div className="hero-button" onClick={handleMakeEvent}>
              + CREATE EVENT
            </div>
          </div>
        </div>
      </div>
      <div className={`${viewMode === "Default" ? "calendar" : ""}`}></div>
      <div className="calendar-container">
        {viewMode == "Calendar" ?
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
              <div className="view-container">
                <div className="view-text-container">
                  <div className="view-text" >VIEW</div>
                </div>
                <button
                  className={`view-tab ${viewMode === "Default" ? "active" : ""}`}
                  onClick={() => { handleViewMode("Default") }}
                >
                  Default
                </button>
                <button
                  className={`view-tab ${viewMode === "Calendar" ? "active" : ""}`}
                  onClick={() => { handleViewMode("Calendar") }}
                >
                  Calendar
                </button>
              </div>
            </div>
            <div className="calendar-body">
              <div className="calendar-navigation">
                <button className="nav-button" onClick={() => getPreviousMonth()}>
                  <ChevronLeft size={20} />
                </button>
                <h2 className="month-title">{currentMonth}</h2>
                <button className="nav-button" onClick={() => getNextMonth()}>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Days */}

              <div className="calendar-days">
                <button className="nav-button">
                  <ChevronLeft size={16} onClick={() => getPreviousWeek()} />
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
                              <div>
                                {events !== undefined ? (
                                  events.length >= 3 ? (
                                    "•••"
                                  ) : events.length >= 1 ? (
                                    "•"
                                  ) : (
                                    <div style={{ visibility: 'hidden' }}>.</div>
                                  )
                                ) : null}
                              </div>
                            </div>
                          </button>

                        </div>
                      ))
                    )}
                  </div>
                </div>
                <button className="nav-button">
                  <ChevronRight size={16} onClick={() => getNextWeek(true)} />
                </button>

              </div>
              {/* Events List */}
              <div className="list-group-container current">
                {selectedDate === null ? (
                  <p>Loading...</p>
                ) : !Array.isArray(selectedDate) ? (
                  <p>Unexpected error</p>
                ) : selectedDate.length === 0 ? (
                  <VisibleEventEndMarker />
                ) : (
                  selectedDate.map((event) => (
                    <EventCard id={event._id} key={event._id} removeFromList={() => { }} orgName={"Placeholder"} onClick={() => {
                      router.push(`/events/editor?id=${event._id}`)
                    }} />
                  ))
                )}
              </div>
            </div>
          </> : <>
            <div className="list-container">
              <div className="list-option-container" >
                <div className="tags-container">
                  {["All", "Current", "Upcoming", "Drafts", "Past"].map((tab) => (
                    <button
                      key={tab}
                      className={`list-tab ${activeTab === tab ? "active" : ""}`}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="view-container">
                  <div className="view-text-container">
                    <div className="view-text" >VIEW</div>
                  </div>
                  <button
                    className={`view-tab ${viewMode === "Default" ? "active" : ""}`}
                    onClick={() => { handleViewMode("Default") }}
                  >
                    Default
                  </button>
                  <button
                    className={`view-tab ${viewMode === "Calendar" ? "active" : ""}`}
                    onClick={() => { handleViewMode("Calendar") }}
                  >
                    Calendar
                  </button>
                </div>
              </div>
              <div className="list-current-container">
                {listEventsRef.current == null ||
                  (Object.keys(listEventsRef.current).length === 1 &&
                    (
                      listEventsRef.current["Upcoming"]?.length == 0 ||
                      listEventsRef.current["Past"]?.length == 0 ||
                      listEventsRef.current["Current"]?.length == 0
                    ))
                  ? (
                    <div>
                      <VisibleEventEndMarker />
                    </div>
                  ) : (
                    Object.entries(listEventsRef.current).map(([groupName, events]) => (
                      <div key={groupName} className='event-content-container'>
                        <div className="event-header">
                          <div className="current-title">{`${groupName.toUpperCase()} EVENTS`}</div>
                          <div className="event-count">{`${listEventsRef.current[groupName].length}`}</div>
                        </div>
                        <div className={`list-group-container ${groupName.toLowerCase()}`}>
                          {events.map((event: Event, index) => {
                            if (groupName === "Current") {
                              return (
                                <EventCard id={event._id} key={event._id} removeFromList={() => { }} orgName={"Placeholder"} onClick={() => {
                                  router.push(`/events/editor?id=${event._id}`)
                                }} />
                              );
                            } else if (groupName === "Past") {
                              return (
                                <div key={event._id} className="event-item past-event">
                                  <div className="event-details-content">
                                    <div className="event-title">{event.name}</div>
                                    <div >•</div>
                                    <div className="event-info-past">
                                      <div className="event-date">
                                        {event.date != null
                                          ? new Date(event.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          }).toUpperCase()
                                          : "No date"}
                                      </div>
                                      <div >|</div>
                                      <div className="event-time">
                                        {event.date != null
                                          ? new Date(event.date).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          : "No time"}
                                      </div>
                                      <div className="event-location">
                                        {event.locationString == null ? "No location specified" : event.locationString}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (groupName === "Upcoming") {
                              return (
                                <EventCard id={event._id} key={event._id} removeFromList={() => { }} orgName={"Placeholder"} onClick={() => {
                                  router.push(`/events/editor?id=${event._id}`)
                                }} />
                              );
                            } else {
                              return (
                                <div key={event._id} className="event-item">
                                  <div className="event-details-content">
                                    <div className="event-title">{event.name}</div>
                                    <div>•</div>
                                    <div className="event-info">
                                      <div className="event-date">
                                        {event.date != null
                                          ? new Date(event.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          }).toUpperCase()
                                          : "No date"}
                                      </div>
                                      <div>|</div>
                                      <div className="event-time">
                                        {event.date != null
                                          ? new Date(event.date).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          : "No time"}
                                      </div>
                                      <div >•</div>
                                      <div className="event-location">
                                        {event.locationString == null ? "No location specified" : event.locationString}
                                      </div>
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
                <div className="current-item"></div>
              </div>

            </div>

          </>
        }
      </div>
    </div>
  );
};

export default UpcomingCalendar;
