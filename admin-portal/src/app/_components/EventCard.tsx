import React, { useState, useEffect, MouseEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import EventModal from './EventModal';
import { EventData } from '../_interfaces/EventInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import EventEditor from './EventEditor';
import useApiAuth from '../_hooks/useApiAuth';
import { RequestType, Request } from '../_interfaces/RequestInterfaces';

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
}

export default function EventCard({ id, removeFromList }: EventCardProps) {
    const [showButtons, setShowButtons] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
    const sendRequest = useApiAuth();

    const deleteEvent = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            removeFromList(id);
            const body = {};
            const endpoint = `events/${id}`;
            const requestType = RequestType.DELETE;
            await sendRequest({ requestType, endpoint, body });
        } catch (err) {
            console.log(err);
        }
    };

    const editEvent = async (name: string, date: Date, description: string, tags: string[]) => {
        try {
            const requestType = RequestType.PATCH;
            const body = {
                name: name,
                date: date,
                description: description,
                tags: tags
            };
            const endpoint = `events/${id}`;
            const data = await sendRequest({ requestType, body, endpoint });
            setEventData(data);
        } catch (err) {
            console.log(err);
        }
    }

    const getEventById = async () => {
        try {
            const body = {};
            const requestType = RequestType.GET;
            const endpoint = `events/${id}`
            const data = await sendRequest({ requestType, endpoint, body });
            return data;
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

    const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
        // Show EditCard modal
        e.stopPropagation();
        setIsEditing(!isEditing);
    };
    const handleCloseClick = () => {
        // Close EditCard modal
        setIsEditing(false);
    };

    const handleCardClick = () => {
        // Show EventModal
        setShowModal(!showModal);
    }

    return (
        // Show event name, show buttons on hover
        <div>
            <div
                onMouseEnter={() => setShowButtons(true)}
                onMouseLeave={() => setShowButtons(false)}
                onClick={() => handleCardClick()}
            >
                <p>{eventData?.name}</p>
                {showButtons && (
                    <>
                        <button onClick={deleteEvent}>Delete</button>
                        <button onClick={handleEditClick}>Edit</button>
                    </>
                )}
            </div>

            {showModal && (
                <>
                    <EventModal
                        _id={eventData?._id}
                        name={eventData?.name}
                        description={eventData?.description}
                        organizerId={eventData?.organizerId}
                    />
                </>
            )}

            {isEditing && <EventEditor id={id} handleCloseClick={handleCloseClick} handleEditEvent={editEvent} />}
        </div>
    );
}