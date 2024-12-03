import React, { useState } from 'react';
import axios, { AxiosResponse } from "axios";

interface EditCardProps {
    id: string;
    handleCloseClick: () => void;
}

interface ActivityContent {
    [key: string]: unknown; // Represents mixed content in the `content` field
  }
  
  interface Activity {
    type: string; // Type of the activity (e.g., "Workshop", "Keynote")
    content: ActivityContent; // Additional details about the activity
    timeStart: Date; // Start time of the activity
    timeEnd: Date; // End time of the activity
    active: boolean; // Whether the activity is active
  }

interface EventData {
    _id?: string;
    name?: string;
    date?: Date;
    description?: string;
    location?: string;
    organizerId?: string;
    tags?: string[];
    registeredUsers?: string[];
    activities?: Activity[];
}

const editEvent = async (id : string, updatedEventData: EventData) => {
    try {
        const response : AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/editEventDetails/${id}`, updatedEventData);
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export default function EditCard({ id, handleCloseClick }: EditCardProps) {
    // const [editDetails, doneEdit] = useState(false);
    // const [loading, setLoading] = useState(true);
    const [updatedEventData, setUpdatedEventData] = useState<EventData>({ });

    // useEffect(() => {
        
    // }, []);

    return (
        <div>
            <label>
                Name:
                <input type="text" name="name" placeholder="Name" value={updatedEventData.name} />
            </label>
            <label>
                Date:
                <input type="date" name="date" placeholder="Date" />
            </label>
            <label>
                Description:
                <input type="text" name="description" placeholder="Description" />
            </label>
            <button onClick={handleCloseClick}>
                Submit Changes
            </button>
        </div>
    );

}