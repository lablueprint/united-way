import React, { useState, useEffect, MouseEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import EventEditor from "./EventEditor";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

interface EventCardProps {
    id: string;
    removeFromList: (id: string) => void;
    orgName: string;
}

export default function EventCard({ id, removeFromList, orgName }: EventCardProps) {
    const [showButtons, setShowButtons] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [eventName, setEventName] = useState("");
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    const deleteEvent = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            removeFromList(id);
            const response: AxiosResponse = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
        } catch (err) {
            console.log(err);
        }
    };

    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
            const { data } = response.data;
            setEventName(data.name)
            // return data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getEventById();
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
                <p>{eventName}</p>
                {showButtons && (
                    <>
                        <button onClick={deleteEvent}>Delete</button>
                        <button onClick={() => {setIsEditing(!isEditing);}}>Edit</button>
                    </>
                )}
            </div>

            {isEditing && <EventEditor orgName={orgName} changeState={setIsEditing} eventId={id} justCreated={false}/>}
        </div>
    );
}