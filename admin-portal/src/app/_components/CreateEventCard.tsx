import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventData } from "../_interfaces/EventInterfaces";

interface CreateEventCardProps {
    orgName: string;
}

export default function CreateEventCard({orgName}: CreateEventCardProps) {
    const [updatedName, setUpdatedName] = useState<string>("");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("");
    const [updatedTags, setUpdatedTags] = useState<string[]>([]);
    const [submissionStatus, setSubmissionStatus] = useState<string>("");
    // TODO: Location API state variables

    const clearEvent = () => {
        setUpdatedName("");
        setUpdatedDate(new Date);
        setUpdatedDescription("");
        setUpdatedTags([]);
        setSubmissionStatus("Cleared!");
    }

    const notEmpty = () => {
        return ((updatedName != "") &&
                (updatedDescription != "") &&
                (updatedTags.length > 0))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            if (notEmpty()) {
                const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/createEvent`);
                setSubmissionStatus(`Success!: ${response}`);
            }
            else {
                setSubmissionStatus(`Error: Empty Args`);
            }
        } catch (err) {
            console.log(err);
            setSubmissionStatus(`Failure: ${err}`);
        }
    }
    
    return ( 
        <div>
            <h3>
                New event for {orgName}:
            </h3>

            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" placeholder="Name" value={updatedName} onChange={(event) => { setUpdatedName(event.target.value) }} />
                </label>
                <label>
                    Date:
                    <input type="date" name="date" placeholder="Date" value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''} onChange={(event) => { setUpdatedDate(new Date((event.target as HTMLInputElement).value)) }} />
                </label>
                <label>
                    Description:
                    <input type="text" name="description" placeholder="Description" value={updatedDescription} onChange={(event) => { setUpdatedDescription(event.target.value) }} />
                </label>
                <label>
                    Tags:       {/* TODO: Clarify tags */}
                    <input
                        type="text"
                        name="tags"
                        placeholder="Tags"
                        value={Array.isArray(updatedTags) ? updatedTags.join(', ') : ''}
                        onChange={(event) => { setUpdatedTags(event.target.value.split(', ')) }}
                    />
                </label>
                <input type="submit" value="Publish!" /> {/* TODO: This always closes for some reason */}
            </form>
            
            <button onClick={clearEvent}>
                Clear
            </button>
            <h3>
                {submissionStatus}
            </h3>
        </div> 
    );
}