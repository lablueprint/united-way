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
    // updatedAddress is the address inputted into the input box on the form
    const [updatedAddress, setAddress] = useState<string>("");
    // updatedInAddress stores the address from the JSON returned by the API request
    const [updatedInAddress, setInAddress] = useState<string>("");
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    // Make all inputtables empty on Organization page
    const clearEvent = () => {
        setUpdatedName("");
        setUpdatedDate(new Date);
        setUpdatedDescription("");
        setUpdatedTags(Array(EventTags.length).fill(false));
        setLatitude(0);
        setLongitude(0);
        setInAddress("");
        setAddress("");
        setSubmissionStatus("Cleared!");
    }

    // Checks if all inputtables are non-empty
    const notEmpty = () => {
        return ((updatedName != "") &&
                (updatedDescription != "") &&
                (updatedTags.includes(true)) &&
                ((currLatitude == 0) && (currLongitude == 0)))
    }

    // TODO: maybe refresh to populate the event into org upon successful patch?
    // TODO: Update schema to handle user count?
    // Creates a JSON and attempts to patch it to DB
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
                if ((currLatitude == 0) && (currLongitude == 0)) {
                    errs = errs + "Address "
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
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const query = `${latitude}, ${longitude}`;
                    console.log("query", query);
                    getLocationJSON(query);
                },
                (err) => {
                    console.error("Error: Could not retrieve location", err);
                }
            );
        }
    }

    // Send request with address to Nominatim endpoint and receive back latitude, longitude in JSON
    // https://nominatim.org/release-docs/develop/api/Search/
    const getLocationJSON = async (address: string) => {
        // Convert address to url (aka add +'s in every space)
        const convertedAddress = address.trim().replaceAll(" ", "+");
        const url = "https://nominatim.openstreetmap.org/search?q=" + convertedAddress + "&format=json";
        console.log("url", url);
        
        try {
            const response: AxiosResponse = await axios.get(
                `${url}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${org.authToken}`
                    }
                }
            );
            console.log("Nominatim Success: ", response);
            const data = response.data;
            if (data.length > 0) {
                // Multiple addresses returned
                if (data.length > 1) {
                    // TODO: Figure this out
                    console.log("multiple");
                    const internals = data[0];
                    setInAddress(internals.display_name);
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                }
                // Single address returned
                else {
                    const internals = data[0];
                    setInAddress(internals.display_name);
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                }
            }
            else {
                console.log("Nominatim Error: Invalid Input Address");
                setInAddress("Invalid Address");
                setLatitude(0);
                setLongitude(0);
            }
        } catch (err) {
            console.log(err);
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
                Address:
                <input type="text" name="location" placeholder="Location" value={updatedAddress} onChange={(event) => { setAddress(event.target.value) }} />
            </label>
            <br/>
            <button onClick={()=>getLocationJSON(updatedAddress)}>
                Get Address Info
            </button> 
            <button onClick={()=>{getUserLocation()}}>
                Get Address from Current Location
            </button> 
            {/*TODO: Add logic for duplicate addresses */}
            <h3>Address: {updatedInAddress}</h3>
            <h3>Latitude: {currLatitude}</h3>
            <h3>Longitude: {currLongitude}</h3>
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
            <h3>
                {submissionStatus}
            </h3>
        </div> 
    );
}