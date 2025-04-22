import React from 'react';
import EventDetailsPage from './EventSignIn';

interface EventModalProps {
    _id: string;
    name: string;
    description: string;
    organizerId: string;
}


export default function EventModal({_id, name, description, organizerId }: EventModalProps) {
    
    return (
        <>
            <div>
                <p>Event: {name}</p>
                <EventDetailsPage _id={_id}/>
                <p>Event Description: {description}</p>
                <p>Organization: {organizerId}</p>
            </div>
        </>
    )
}