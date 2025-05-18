"use client";
import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import EventCard from "@/app/_components/EventCard";
import EventCreator from "@/app/_components/EventCreator";
import EventCarousel from "@/app/_components/EventCarousel";
import NoMoreEventsTrigger from "@/app/_components/NoMoreEvents";
import emptyLogo from '../../../../public/images/logo-blue-50.svg';
import addIcon from '../../../../public/images/add-icon.svg';
import rightArrow from '../../../../public/images/right-arrow.svg';
import Image from "next/image";
import single from '../../../../public/images/single-event.svg';
import attendee from '../../../../public/images/attendee.svg';
import { useState, useEffect } from "react";
import './home.css';

export default function Landing() {
  const [responseValue, setResponseValue] = useState();
  const dispatch = useDispatch();
  const router = useRouter();
  interface RootState {
    auth: {
      orgId: string;
      authToken: string;
      refreshToken: string;
    };
  }

  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
  const dispatchLogout = async () => {
    await dispatch(logout());
  }

  interface EventData {
    _id: string;
    name: string;
    date: Date;
    description: string;
    location: {
      type: string;
      coordinates: number[];
    };
    organizerID: string;
    tags: string[];
    registeredUsers: string[];
    imageURL: string;
    // activities: Activity[];
  }

  const isToday = ( inputDate : Date ) => {
    const today = new Date();

    return ((inputDate.getDate() == today.getDate()) &&
       (inputDate.getMonth() == today.getMonth()) &&
       (inputDate.getFullYear() == today.getFullYear()));
  }

  const isUpcoming = ( inputDate : Date ) => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const copyInput = new Date(inputDate); //prevent mutating original 
    copyInput.setHours(0,0,0,0);
    
    return copyInput >= today;
  }

  // event schema has the date as a string right now, but needs to be event object
  const location = "Los Angeles, CA";
  const startTime = "12:00"; // need to figure out am/pm stuff later
  const endTime = "12:01";

  const getMonthAbbreviation = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  };

  // pulling events and organizer info
  const [atBottom, setAtBottom] = useState(false);
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [upcomingIds, setUpcomingIds] = useState<string[]>([]);
  const [todayIds, setTodayIds] = useState<string[]>([]);
  const [eventData, setEventData] = useState<EventData>({
    organizerID: "",
    _id: "",
    name: "",
    date: new Date(),
    description: "",
    location: {
        type: "",
        coordinates: [],
    },
    tags: [],
    registeredUsers: [],
    imageURL: "",
  });

  // slider states
  const [allEvents, setAllEvents] = useState<EventData[]>([]);

  const removeFromList = (id: string) => {
    setEventIds(eventIds.filter((eventId) => eventId != id));
  };

  const getEventById = async (id: string) => {
    try {
        const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${org.authToken}`
            }
        });
        const { data } = response.data;
        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

useEffect(() => {
  const fetchTodayEvent = async () => {
    if (todayIds.length === 1) {
      const data = await getEventById(todayIds[0]);
      if (data) {
        setEventData({
          ...data,
          date: new Date(data.date)
        });
      }
    }
  };
  fetchTodayEvent();
}, [todayIds]);

useEffect(() => {
  const fetchAllTodayEvents = async () => {
    const events: EventData[] = [];
    for (const id of todayIds) {
      const data = await getEventById(id);
      if (data) {
        events.push({ ...data, date: new Date(data.date) });
      }
    }

    setAllEvents(events);
  };

  if (todayIds.length > 0) {
    fetchAllTodayEvents();
  }
}, [todayIds]);


// // Auto Scroll for Slider
// useEffect(() => {
//   if (visibleEvents.length < 4) return;

//   const interval = setInterval(() => {
//     setFocusIndex(prev => {
//       if (prev < 3) {
//         return prev + 1; // move focus down
//       } else {
//         // shift window
//         const nextEvent = allEvents[nextItemIndex % allEvents.length];
//         const newVisible = [nextEvent, ...visibleEvents.slice(0, 3)];
//         setVisibleEvents(newVisible);
//         setNextItemIndex(i => (i + 1) % allEvents.length);
//         return 0; // focus resets to top
//       }
//     });
//   }, 2000);

//   return () => clearInterval(interval);
// }, [visibleEvents, nextItemIndex, allEvents]);


useEffect(() => {
  // Get organization info
  const getOrganizationData = async () => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${org.authToken}`
        }
      });
      const { data } = response.data;
      setOrgName(data.name);
    }
    catch (err) {
      console.log(err);
    }} 
    // Get all events
    const getOrganizerEvents = async () => {
      try {
        const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
          {
            organizerID: org.orgId
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`
            }
          }
        );
        const { data } = response.data;
        const normalizedEventData = data.map((event : EventData) => ({
          ...event,
          date: new Date(event.date),
        }))

        setTodayIds((normalizedEventData.filter((event: EventData) => isToday(event.date) == true)).map((event: EventData) => event._id));
        setUpcomingIds(
          normalizedEventData
            .filter((event: EventData) => isUpcoming(event.date))
            .sort((a: EventData, b: EventData) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event: EventData) => event._id)
        );
      }
      catch (err) {
        console.log(err);
      }
    }
    getOrganizationData();
    getOrganizerEvents();
  }, []);

  return (
    <div className="body">
      <div className="nav-bar"> 
        <button className="button" onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
          Log out
        </button>
      </div>
      <div className="hero">      
        <div className="hero-info">
          <div className="hero-header">
            <h1 className="hero-welcome">Welcome, {orgName}</h1>
            <p className="hero-text">This is your admin portal. You’re able to manage events and rewards for users.</p>
          </div>
          <button 
            className="button"
            onClick={() => {setIsEditing(!isEditing)}}  
          >
            <Image src={addIcon} alt="Plus icon for creating a new event" width={10}/>
            {isEditing ? "Cancel Event" : "Create Event"}
          </button>
        </div>
      </div>
      { upcomingIds.length > 0 ? (
        <div className="content">
          <div className="event-container">
            {/* If no events today, display empty event screen. */}
            { todayIds.length > 0 ? (
              <div>
                <div className="event-list today-list">
                  {/* single event view*/}
                  { todayIds.length == 1 ? (
                      <div className="single event-today">
                          <Image className="single-event-img" src={single} alt="Event thumbnail"/>
                          <div className="event-info">
                            <div className="event-date-time">
                              <p className="event-date">Today</p>
                              <p className="event-time">{startTime} - {endTime}</p>
                            </div>
                            <div className="event-name">{eventData.name}</div>
                            <div className="event-details">
                            <div className="event-location">{location}</div>
                              <div className="event-attendees">
                                <Image src={attendee} alt="Attendee icon" />
                                <p className="attendee-info">{eventData.registeredUsers.length} Attendees</p>
                              </div>
                            </div>
                        </div>
                      </div>

                  ) : (
                    <EventCarousel events={allEvents} intervalMs={2000} visibleCount={4} />
                  )}
                </div>
              </div>
            ) : ( 
              <div className="empty-list">
                <div className="empty-list-container">
                  <h2 className="empty-title">Events Today</h2>
                  <div className="empty-content-container">
                    <div className="empty-img-container">
                      <Image width={80} src={emptyLogo} alt="United Way Logo Sheer Blue"/>
                    </div>
                    <p className="empty-text">No events today.</p>
                  </div>
                </div>
              </div>
            )} 
          </div>
          <div className="event-container">
            <div className="list-title">
              <h2 className="subtitle">Upcoming Events</h2>
              <h2 className="subtitle-link">View All Events <Image className="arrow-icon" width={11} src={rightArrow} alt="Right Arrow Icon"/></h2>
            </div>
            <div className="event-list upcoming-list">
              { upcomingIds.length > 0  && upcomingIds.map((id: string) => {
                return (
                  <EventCard id={id} key={id} removeFromList={removeFromList} />
                );
              })}
            </div>
          </div>
          <NoMoreEventsTrigger />
        </div>
        
        ) : (
          <div className="empty-event">
            <div className="empty-content">
              <Image src={emptyLogo} alt="United Way Sheer Blue Logo" width={80}/>
              <p className="empty-text">No upcoming events.</p>
            </div>
          </div>

        )}
            
      <button onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
        Log out
      </button>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Cancel Event" : "Create Event"}
      </button>
      {isEditing && <EventCreator orgName={orgName} changeState={setIsEditing} />}
      <div>

        Org: {org.orgId}<br />
        Auth: {org.authToken}<br />
        Refresh: {org.refreshToken}<br />
      </div>

    </div>
  );
  
}