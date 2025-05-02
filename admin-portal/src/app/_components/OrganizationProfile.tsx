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
  const [orgName, setOrgName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    useEffect(() => {
        // Get all events
      const fetchEvents = async () => {
          try {
              const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/`);
              const { data } = response.data;
              setEventIds(data.map((event: EventData) => event._id));
              setOrgName("test org"); // Hardcoded, Sign-in doesn't pass down org name yet
          } catch (err) {
              console.log(err);
          }
      }
      fetchEvents();
    }, []);

    return (
        <div>
            <h1>Organization Profile</h1>
            <div>
                <h2>Events</h2>
                <div>
                    {eventIds.map((id: string) => (
                        <EventCard id={id} key={id} />
                    ))}
                </div>
            </div>
            <button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel Event" : "Create Event"}
            </button>
            {isEditing && <EventCreator orgName={orgName} changeState={setIsEditing} />}
        </div>
  );
}