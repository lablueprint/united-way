import React, { useState, useEffect, MouseEvent } from 'react';
import EventEditor from "./EventEditor";
import useApiAuth from '../_hooks/useApiAuth';
import { RequestType, Request } from '../_interfaces/RequestInterfaces';
import { EventData } from '../_interfaces/EventInterfaces';

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
    orgName: string;
}

export default function EventCard({ id, removeFromList, orgName }: EventCardProps) {
    const [showButtons, setShowButtons] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [eventData, setEventData] = useState<EventData>({
        organizerId: "",
        _id: "",
        name: "",
        date: new Date(),
        draft: true,
        draftList: [],
        startTime: "",
        endTime: "",
        description: "",
        location: {
            type: "",
            coordinates: [],
        },
        tags: [],
        registeredUsers: [],
        activities: []
    });
    const [org, sendRequest] = useApiAuth();

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
            setEventData(await getEventById());
        };
        fetchData();
    }, []);

    return (
        // Show event name, show buttons on hover
        <div>
            <div
                onMouseEnter={() => setShowButtons(true)}
                onMouseLeave={() => setShowButtons(false)}
            >
                <p>{eventData.name}</p>
                {showButtons && (
                    <>
                        <button onClick={deleteEvent}>Delete</button>
                        <button onClick={() => { setIsEditing(!isEditing); }}>Edit</button>
                    </>
                )}
            </div>

            {isEditing && <EventEditor orgName={orgName} changeState={setIsEditing} eventId={id} justCreated={false} />}
        </div>
    );
}