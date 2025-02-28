import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventTags } from "../_interfaces/EventInterfaces";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

interface CreateEventCardProps {
    orgName: string;
    changeState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateEventCard({orgName, changeState}: CreateEventCardProps) {
    const [updatedName, setUpdatedName] = useState<string>("");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("");
    const [updatedTags, setUpdatedTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const [submissionStatus, setSubmissionStatus] = useState<string>("");
    const [currLatitude, setLatitude] = useState<number>(0);
    const [currLongitude, setLongitude] = useState<number>(0);
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    useEffect(() => {
        return () => {
            getUserLocation();
        };
    }, []);

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
                (updatedTags.includes(true)))
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
                            coordinates: [currLatitude, currLongitude]
                        },
                        organizerID: org.orgId,
                        tags: selectedTags,
                        registeredUsers: [],
                        activity: []
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${org.authToken}`
                        }
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

    // Use HTML GeoLocation API to get the user's location (shall their web browser permit)
    // Updates state variables latitude, longitude if it works
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Try to get user's location
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('coords', position.coords);
                    console.log('lat, long', latitude, longitude);
                    setLatitude(latitude);
                    setLongitude(longitude);
                },
                (err) => {
                    console.error("Error: Could not retrieve location", err);
                }
            );
        }
        else {
            console.error("Geolocation API not supported on browser");
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
            
            <button onClick={clearEvent}>
                Clear
            </button>
            <button onClick={getUserLocation}>
                Get Current Location
            </button>
            <h3>
                {submissionStatus}
            </h3>
        </div> 
    );
}