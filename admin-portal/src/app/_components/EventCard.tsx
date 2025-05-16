import React, { useState, useEffect, MouseEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import EventModal from './EventModal';
import { EventData } from '../_interfaces/EventInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import EventEditor from './EventEditor';
import Image from 'next/image';
import placeholder from '../../../public/images/event-img.svg';

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
}

export default function EventCard({ id, removeFromList }: EventCardProps) {
    // make image static right now? need to add into schema later on?
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
    // event schema has the date as a string right now, but needs to be event object
    const location = "Los Angeles, CA";
    const startTime = "12:00"; // need to figure out am/pm stuff later
    const endTime = "12:01";
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    const deleteEvent = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            removeFromList(id);
            await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
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
                }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
            const { data } = response.data;
            setEventData(data);
        } catch (err) {
            console.log(err);
        }
    }

    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
            const { data } = response.data;
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

    const getMonthAbbreviation = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    };
    
    return (
        <div className="event-card">
            <Image className="event-image" style={{ objectFit: 'contain' }} src={placeholder} alt="Event thumbnail"/>
            <div className="event-info">
                <div className="event-name">{eventData.name}</div>
                <div className="event-date-time">
                    <p className="event-date">{getMonthAbbreviation(eventData.date)} {eventData.date.getDate()}</p>
                    <p className="event-time">{startTime} - {endTime}</p>
                </div>
                <div className="event-location">{location}</div>
            </div>
            
            
        </div>
        // Show event name, show buttons on hover
        // <div>
        //     <div
        //         onMouseEnter={() => setShowButtons(true)}
        //         onMouseLeave={() => setShowButtons(false)}
        //         onClick={() => handleCardClick()}
        //     >
        //         <p>{eventData?.name}</p>
        //         {showButtons && (
        //             <>
        //                 <button onClick={deleteEvent}>Delete</button>
        //                 <button onClick={handleEditClick}>Edit</button>
        //             </>
        //         )}
        //     </div>

        //     {showModal && (
        //         <>
        //             <EventModal
        //                 _id={eventData?._id}
        //                 name={eventData?.name}
        //                 description={eventData?.description}
        //                 organizerId={eventData?.organizerId}
        //             />
        //         </>
        //     )}

        //     {isEditing && <EventEditor id={id} handleCloseClick={handleCloseClick} handleEditEvent={editEvent} />}
        // </div>
    );
}