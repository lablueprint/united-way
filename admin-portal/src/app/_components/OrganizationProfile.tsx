import React, { useState, useEffect } from "react";
import EventCard from "./EventCard";
import EventCreator from "./EventCreator";
import { EventData } from '../_interfaces/EventInterfaces';
import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";
import { useDispatch } from "react-redux";
import { refresh } from "../_utils/redux/orgSlice";

// TODO: Make the organization profile based on each individual organization instead of all events.
export default function OrganizationProfile() {
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const sendRequest = useApiAuth()
  const dispatch = useDispatch();

  useEffect(() => {
    // Get all events
    const getOrganizerEvents = async () => {
      try {
        const requestType = RequestType.GET;
        const endpoint = "events/orgs/:id";
        const body = {};
        const data = await sendRequest({ requestType, body, endpoint })
        setEventIds(data.map((event: EventData) => event._id));
        setOrgName("test org"); // Hardcoded, Sign-in doesn't pass down org name yet
      }
      catch (err) {
        console.log(err);
      }
    }
    getOrganizerEvents();
  }, []);

  const removeFromList = (id: string) => {
    setEventIds(eventIds.filter((eventId) => eventId != id));
  };

  return (
    <div>
      <h1>Organization Profile</h1>
      <button onClick={() => { dispatch(refresh({ authToken: "invalid" })) }}>
        remove authToken
      </button>
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
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Cancel Event" : "Create Event"}
      </button>
      {isEditing && <EventCreator orgName={orgName} changeState={setIsEditing} />}
    </div>
  );
}