import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EditCard from "./EditCard";
import { EventData } from '../_interfaces/EventInterfaces';
import { ActivityContent } from '../_interfaces/EventInterfaces';

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
}

export default function EventCard({ id, removeFromList }: EventCardProps) {
    const [showButtons, setShowButtons] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [eventData, setEventData] = useState<EventData>({
        organizerId: "",
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
        activities: []
    });
    const [activityData, setActivityData] = useState<ActivityContent>({
        eventID: "",
        type: "",
        content: "",
        timeStart: new Date(),
        timeEnd: new Date(),
        active: false,
    });

    const deleteEvent = async () => {
        try {
            removeFromList(id);
            await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`);
        } catch (err) {
            console.log(err);
        }
    };

    const editEvent = async (name: string, date: Date, description: string, tags: string[]) => {
        try {
            const response: AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`,
                {
                    name: name,
                    date: date,
                    description: description,
                    tags: tags
                });
            const { data } = response.data;
            setEventData(data);
        } catch (err) {
            console.log(err);
        }
    }

    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`);
            const { data } = response.data;
            return data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    const getActivityById = async (activityID :string) => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`);
            // console.log("EventCard ActivityID", `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID[0]}`);
            // console.log("EventCard [0]", activityID[0]);
            const { data } = response.data;
            // console.log("EventCard getActivityById", data);
            return data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById();
            // console.log("EventCard getEventById", data);
            // const activityResponse = await getActivityById(data.activity);
            // console.log("useEffect getActivityById", data.activity);
            setEventData(data);
            // setActivityData(activityResponse);
        };
        fetchData();
    }, []);

    const handleEditClick = () => {
        // Show EditCard modal
        setIsEditing(true);
    };
    const handleCloseClick = () => {
        // Close EditCard modal
        setIsEditing(false);
    };

    return (
        // Show event name, show buttons on hover
        <div
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
        >
            <p>{eventData?.name}</p>
            {showButtons && (
                <>
                    <button onClick={deleteEvent}>Delete</button>
                    <button onClick={handleEditClick}>Edit</button>
                </>
            )}

            {isEditing && <EditCard id={id} handleCloseClick={handleCloseClick} handleEditEvent={editEvent} />}
        </div>
    );
}

