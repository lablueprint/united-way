
import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";

// function Button() {
//     const [buttonText, setButtonText] = useState('Click me, please');
//     function handleClick() {
//         return setButtonText('Thanks, been clicked!');
//     }
//     return <button onClick={handleClick}>{buttonText}</button>;
// }

//const response : AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/`)
interface EventCardProps {
    id: string;
}

const deleteEvent = async (id : string) => {
    try {
        const response : AxiosResponse = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/deleteEvent/${id}`);
        return response;
    } catch (err) {
        console.log(err);
    }
    return -1;

};

// const editEvent = async (id : string, updatedEventData) => {
//     try {
//         const response : AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/editEventDetails/${id}`, updatedEventData);
//         return response;
//     } catch (err) {
//         console.log(err);
//         return err;
//     }
// }

const getEventById = async (id : string) => {
    try {
        const response : AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getEventById/${id}`);
        return response.data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

interface EventData {
    _id?: string;
    name?: string;
    date?: string;
    description?: string;
    location?: string;
    tags?: string[];
}

export default function EventCard({ id } : EventCardProps) {    
    const [showButtons, setShowButtons] = useState(false);
    //const [isEditing, setIsEditing] = useState(false);
    const [updatedEventData, setUpdatedEventData] = useState<EventData>({
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById(id);
            setUpdatedEventData(data);
        };
        fetchData();
    }, [id]);

    return (
        <div
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
            style={{color: "red"}}
        >
            Event name
            {showButtons &&
                <button onClick={() => {deleteEvent(id)}}>
                    Delete
                </button>
            }
            {showButtons &&
                <button onClick={() => {deleteEvent("674565d380c3def8b66fa1b7")}}>
                    Get Event info
                </button>
            }
            <div>
                {updatedEventData.description}
            </div>
        </div>
    );
}


//https://www.w3schools.com/react/react_class.asp
