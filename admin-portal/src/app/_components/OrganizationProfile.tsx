import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";
import { EventData } from '../_interfaces/EventInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

// TODO: Make the organization profile based on each individual organization instead of all events.
export default function OrganizationProfile() {
    const [eventIds, setEventIds] = useState<string[]>([]);
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    useEffect(() => {
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
                setEventIds(data.map((event: EventData) => event._id));
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
        </div>
    );
}
