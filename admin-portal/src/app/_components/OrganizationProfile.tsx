import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";

interface ActivityContent {
    [key: string]: unknown; // Represents mixed content in the `content` field
  }
  
  interface Activity {
    type: string; // Type of the activity (e.g., "Workshop", "Keynote")
    content: ActivityContent; // Additional details about the activity
    timeStart: Date; // Start time of the activity
    timeEnd: Date; // End time of the activity
    active: boolean; // Whether the activity is active
  }

interface EventData {
    _id?: string;
    name?: string;
    date?: Date;
    description?: string;
    location?: string;
    organizerId?: string;
    tags?: string[];
    registeredUsers?: string[];
    activities?: Activity[];
}


export default function OrganizationProfile () {
    const [eventIds, setEventIds] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response : AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getAllEvents`);
                setEventIds(response.data.map((event : EventData) => event._id));
            }
            catch (err) {
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
                    {eventIds.map((id: string) => {
                        return <EventCard id={id} key={id}/>;
                    })}
                </div>
            </div>
        </div>
    );
}