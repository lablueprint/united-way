import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EditCard from "./EditCard";

interface EventCardProps {
    id: string;
}

const deleteEvent = async (id: string) => {
    try {
        const response: AxiosResponse = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/deleteEvent/${id}`);
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
};

const getEventById = async (id: string) => {
    try {
        const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getEventById/${id}`);
        console.log("got event");
        return response.data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

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
    location: string;
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
        location: "",
        tags: [],
        registeredUsers: [],
        activities: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById(id);
            setEventData(data);
        };
        fetchData();
    }, [id]);

    const handleEditClick = () => {
        setIsEditing(true); // Show EditCard
        console.log("start editing")
    };
    const handleCloseClick = () => {
        setIsEditing(false); // Show EditCard
        console.log("close modal")
    };

    return (
        <div
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
            style={{ color: "red" }}
        >
            {showButtons && (
                <>
                    <button onClick={() => deleteEvent(id)}>Delete</button>
                    <button onClick={handleEditClick}>Edit</button>
                </>
            )}
            <p>{eventData.name}</p>
            {/* {isEditing && (
                <div className="modal-overlay" onClick={handleCloseClick}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <EditCard id={id} />
                        <button className="close-button" onClick={handleCloseClick}>Close</button>
                    </div>
                </div>
            )} */}
            {isEditing && <EditCard id={id} handleCloseClick={handleCloseClick}/>}
        </div>
    );
}

