import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";

interface ActivityContent {
    [key: string]: unknown;
}

// EventData interface
interface Activity {
    type: string;
    content: ActivityContent;
    timeStart: Date;
    timeEnd: Date;
    active: boolean;
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
    organizerId: string;
    tags: string[];
    registeredUsers: string[];
    activities: Activity[];
}

export default function OrganizationProfile () {
    const [eventIds, setEventIds] = useState<string[]>([]);

    useEffect(() => {
        // Get all events
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

    const removeFromList = (id: string) => {
        setEventIds(eventIds.filter((eventId) => eventId != id));
    }

    return (
        <div>
            <h1>Organization Profile</h1>
            <div>
                <h2>Events</h2>
                <div>
                    {eventIds.map((id: string) => {
                        return <EventCard id={id} key={id} removeFromList={removeFromList}/>;
                    })}
                </div>
            </div>
        </div>
    );
}