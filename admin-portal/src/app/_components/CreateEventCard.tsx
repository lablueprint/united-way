import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventTags } from "../_interfaces/EventInterfaces";

interface CreateEventCardProps {
    orgName: string;
    changeState: React.Dispatch<React.SetStateAction<boolean>>;
    orgID: string;
}

export default function CreateEventCard({orgName, changeState, orgID}: CreateEventCardProps) {
    const [updatedName, setUpdatedName] = useState<string>("");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("");
    const [updatedTags, setUpdatedTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const [submissionStatus, setSubmissionStatus] = useState<string>("");
    // TODO: Location API state variables

    const clearEvent = () => {
        setUpdatedName("");
        setUpdatedDate(new Date);
        setUpdatedDescription("");
        setUpdatedTags(Array(EventTags.length).fill(false));
        setSubmissionStatus("Cleared!");
    }

    const notEmpty = () => {
        return ((updatedName != "") &&
                (updatedDescription != "") &&
                (!updatedTags.includes(true)))
    }

    const handleSubmit = async () => {
        try {
            if (notEmpty()) {
                const selectedTags = updatedTags
                    .map((isSelected, index) => isSelected ? EventTags[index] : null)
                    .filter(tag => tag !== null);
                
                const response: AxiosResponse = await axios.post(
                    `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/createEvent`,
                    {
                        name: updatedName,
                        date: updatedDate,
                        description: updatedDescription,
                        location: {
                            type: "Point",
                            coordinates: [0, 0]
                        },
                        organizerID: orgID,
                        tags: selectedTags,
                        registeredUsers: [],
                        activity: []
                    }
                );
                setSubmissionStatus(`Success!: ${response.data.message}`);
                changeState(false);
            }
            else {
                var errs = "";
                if (updatedName == "") {
                    errs = errs + "Name ";
                }
                if (updatedDescription == "") {
                    errs = errs + "Description ";
                }
                if (!updatedTags.includes(true)) {
                    errs = errs + "Tags ";
                }
                setSubmissionStatus(`Error: Empty Args: ${errs}`);
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
            <br/>
            <label>
                Tags:
                {
                    EventTags.map((tagName, index) => {
                        return (
                            <button key={index} onClick={() => {
                                const newTags = [...updatedTags];
                                newTags[index] = !newTags[index];
                                setUpdatedTags(newTags);
                            }}
                            style={{
                                backgroundColor: updatedTags[index] ? 'green' : 'red',
                                color: 'white'
                            }}>
                                {tagName}
                            </button>
                        )
                    })
                }
            </label>
            <br/>
            <button onClick={handleSubmit}>
                Publish!
            </button>
{/* 
            <button onClick={() => console.log(updatedTags)}>
                Logging Button
            </button> */}
            
            <button onClick={clearEvent}>
                Clear
            </button>
            <h3>
                {submissionStatus}
            </h3>
        </div> 
    );
}