"use client";
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import EventCard from "@/app/_components/EventCard";
import EventEditor from "@/app/_components/EventEditor";
import EventCarousel from "@/app/_components/EventCarousel";
import NoMoreEventsTrigger from "@/app/_components/NoMoreEvents";
import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';
import { UseDispatch } from 'react-redux';
import { EventData } from '@/app/_interfaces/EventInterfaces';
import { refresh } from '../../_utils/redux/orgSlice';
import Image from "next/image";
import { emptyLogo, addIcon, rightArrow, single, attendee } from '../../../../public/Landing/Landing-index';

import { useState, useEffect } from "react";
import axios, { AxiosResponse } from 'axios';
import styles from "./page.module.css"

// TO-DO:
// 1. Link view all events page.
// 2. Make it so start time/end time and location aren't static.
// 3. Replace image placeholders with actual event images.
export default function Landing() {

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
  const dispatch = useDispatch();
  const router = useRouter();
  const [org, sendRequest] = useApiAuth();

  const dispatchLogout = async () => {
    await dispatch(logout());
  }
  // event schema has the date as a string right now, but needs to be event object
  const location = "Los Angeles, CA";
  const startTime = "12:00"; // need to figure out am/pm stuff later
  const endTime = "12:01";

  // pulling events and organizer info
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");
  // const [draftIds, setDraftIds] = useState<string[]>([]);
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

const createBlankEvent = async () => {
  try {
    const requestType = RequestType.POST;
    const endpoint = "events/orgs/:id/createEvent";
    const body = {
      name: "Your Event Name",
      date: new Date(),
      duration: 0, // Hardcoded for now
      draft: true,
      draftList: [],
      description: "Your Event Description",
      startTime: '12:00',
      endTime: '12:01',
      location: {
        type: "Point",
        coordinates: [0, 0]
      },
      organizerID: org.orgId,
      tags: [],
      registeredUsers: [], // Hardcoded for now
      activity: [], // Hardcoded for now
      image: "placeholder" // Hardcoded for now
    };
    const data = await sendRequest({ requestType, endpoint, body });
    return data._id;
  } catch (err) {
    console.log(err);
    return ""
  }
}

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

useEffect(() => {
    const getOrganizerEvents = async () => {
      try {
        const requestType = RequestType.POST;
        const endpoint = "events/filtered";
        const body = {
          organizerID: org.orgId,
          draft: false
        };
        const data = await sendRequest({ requestType, body, endpoint })
        console.log('data', data)
        const normalizedEventData = data.map((event : EventData) => ({
          ...event,
          date: new Date(event.date),
        }))

        setOrgName("Kimberly");
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
    
    getOrganizerEvents();
  }, []);

  return (
    <div className={styles.body}>
      <div className={styles.navBar}> 
        <button className={styles.button} onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
          Log out
        </button>
      </div>
      <div className={styles.hero}>      
        <div className={styles.heroInfo}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroWelcome}>Welcome, {orgName}</h1>
            <p className={styles.heroText}>This is your admin portal. You’re able to manage events and rewards for users.</p>
          </div>
          <button 
            className={styles.button}
            onClick={ async () => { 
              const _id = await createBlankEvent()

              if (_id != "") {
                setIsEditing(!isEditing)
                setEditingId(_id);
              }
            }}>
            <Image src={addIcon} alt="Plus icon for creating a new event" width={10}/>
            {isEditing ? "Cancel Event" : "Create Event"}
          </button>
        </div>
      </div>
      { upcomingIds.length > 0 ? (
        <div className={styles.content}>
          <div className={styles.eventContainer}>
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
              <div className={styles.emptyList}>
                <div className={styles.emptyListContainer}>
                  <h2 className={styles.emptyTitle}>Events Today</h2>
                  <div className={styles.emptyContentContainer}>
                    <div className={styles.emptyImgContainer}>
                      <Image width={80} src={emptyLogo} alt="United Way Logo Sheer Blue"/>
                    </div>
                    <p className={styles.emptyText}>No events today.</p>
                  </div>
                </div>
              </div>
            )} 
          </div>
          <div className={styles.eventContainer}>
            <div className={styles.listTitle}>
              <h2 className={styles.subtitle}>Upcoming Events</h2>
              <h2 className={styles.subtitleLink}>View All Events <Image className="arrow-icon" width={11} src={rightArrow} alt="Right Arrow Icon"/></h2>
            </div>
            <div className={`${styles.eventList} ${styles.upcomingList}`}>
              { upcomingIds.length > 0  && upcomingIds.map((id: string) => {
                return (
                  <EventCard id={id} key={id} removeFromList={removeFromList} orgName={orgName} />
                );
              })}
            </div>
          </div>
          <NoMoreEventsTrigger />
        </div>
        
        ) : (
          <div className={styles.emptyEvent}>
            <div className={styles.emptyContent}>
              <Image src={emptyLogo} alt="United Way Sheer Blue Logo" width={80}/>
              <p className={styles.emptyText}>No upcoming events.</p>
            </div>
          </div>

        )}
            
            {isEditing && <EventEditor orgName={orgName} changeState={setIsEditing} eventId={editingId} justCreated={true} />}
    </div>
  );
  
}