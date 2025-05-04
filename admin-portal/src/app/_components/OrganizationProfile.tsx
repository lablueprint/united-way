import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";
import EventCreator from "./EventCreator";
import { EventData } from '../_interfaces/EventInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

// TODO: Make the organization profile based on each individual organization instead of all events.
export default function OrganizationProfile() {
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string>("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

  useEffect(() => {
    // Get all events
    const getOrganizerEvents = async () => {
      try {
        const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
          {
            organizerID: org.orgId,
            draft: false
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`
            }
          }
        );
        const { data } = response.data;
        setEventIds(data.map((event: EventData) => event._id));
        setOrgName("test org"); // Hardcoded, Sign-in doesn't pass down org name yet
      }
      catch (err) {
        console.log(err);
      }
    }

    const getOrganizerDrafts = async () => {
      try {
        const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
          {
            organizerID: org.orgId,
            draft: true
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`
            }
          },
        );
        const { data } = response.data;
        setDraftIds(data.map((event: EventData) => event._id));
      }
      catch (err) {
        console.log(err);
      }
    }

    getOrganizerEvents();
    getOrganizerDrafts();
  }, []);

  const removeFromList = (id: string) => {
    setEventIds(eventIds.filter((eventId) => eventId != id));
  };

  const createBlankEvent = async () => {
    try {        
      const response: AxiosResponse = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/createEvent`,
        {
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
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${org.authToken}`
          }
        }
      );
    return response.data.data._id
  } catch (err) {
    console.log(err);
    return ""
  }
}

  return (
    <div>
      <h1>Organization Profile</h1>
      <div>
        <h2>Events</h2>
        <div>
          {eventIds.map((id: string) => {
            return (
              <EventCard id={id} key={id} removeFromList={removeFromList} />
            );
          })}
        </div>
      </div>
      <div>
        <h2>Drafts</h2>
        <div>
          {draftIds.map((id: string) => {
            return (
              <EventCard id={id} key={id} removeFromList={removeFromList} />
            );
          })}
        </div>
      </div>
      <button onClick={async () => {
        // Create a new blank, event
        const _id = await createBlankEvent()

        if (_id != "") {
          setIsEditing(!isEditing)}
          setEditingId(_id);
        }
      }>
        Create Event
      </button>
      {isEditing && <EventCreator orgName={orgName} changeState={setIsEditing} eventId={editingId}/>}
    </div>
  );
}