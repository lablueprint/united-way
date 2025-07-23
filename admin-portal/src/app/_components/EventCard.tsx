import Image from 'next/image';
import { MouseEvent, useEffect, useState } from 'react';
import { placeholder } from '../../../public/Landing/Landing-index';
import useApiAuth from '../_hooks/useApiAuth';
import { EventData } from '../_interfaces/EventInterfaces';
import { RequestType } from '../_interfaces/RequestInterfaces';
import '../_styles/EventCard.css';
import EventEditor from "./EventEditor";

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
    orgName: string;
    onClick: () => void;
}

export default function EventCard({ id, removeFromList, orgName, onClick }: EventCardProps) {
    // make image static right now? need to add into schema later on?
    const [showButtons, setShowButtons] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
        activities: [],
        imageUrl: "",
        userCount: 0
    });
    // event schema has the date as a string right now, but needs to be event object
    const location = "Los Angeles, CA";

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
            const data = await getEventById();
            setEventData({
                ...data,
                date: new Date(data.date)
            });
        };
        fetchData();
    }, []);

    const getMonthAbbreviation = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    };

    return (
        // Show event name, show buttons on hover
        <div
            className="event-card"
            onClick={onClick}
        >
            <Image className="event-image" style={{ objectFit: 'contain' }} src={placeholder} alt="Event thumbnail" />
            <div className="event-content-info">
                <div className="event-name">{eventData.name}</div>
                <div className="event-date-time">
                    <p className="event-card-date">{getMonthAbbreviation(eventData.date)} {eventData.date.getDate()}</p>
                    <p>|</p>
                    <p className="event-card-time">{eventData.startTime} - {eventData.endTime} PM</p>
                </div>
                <div className="event-card-location">{location}</div>
            </div>

            {isEditing && <EventEditor eventId={id} />}
        </div>
    );
}