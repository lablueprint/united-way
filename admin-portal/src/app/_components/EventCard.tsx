import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EditCard from "./EditCard";

interface EventCardProps {
    id: string;
}

// EventData interface
interface ActivityContent {
    [key: string]: unknown;
}

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

export default function EventCard({ id }: EventCardProps) {
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

    const deleteEvent = async () => {
        try {
            const response: AxiosResponse = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/deleteEvent/${id}`);
            return response;
        } catch (err) {
            console.log(err);
            return err;
        }
    };
    
    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getEventById/${id}`);
            console.log("got event");
            return response.data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById();
            setEventData(data);
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
            <p>{eventData.name}</p>
            {showButtons && (
                <>
                    <button onClick={() => deleteEvent()}>Delete</button>
                    <button onClick={handleEditClick}>Edit</button>
                </>
            )}
            
            {isEditing && <EditCard id={id} handleCloseClick={handleCloseClick}/>}
        </div>
    );
}

