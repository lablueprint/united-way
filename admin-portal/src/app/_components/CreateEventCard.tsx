import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventTags } from "../_interfaces/EventInterfaces";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import '../_interfaces/styles.css';
import TestLogo from "./logo.jpeg"

interface CreateEventCardProps {
    orgName: string;
    changeState: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LocationProps {
    display_name: string;
    lat: string;
    lon: string;
}

export default function CreateEventCard({orgName, changeState}: CreateEventCardProps) {
    const [updatedName, setUpdatedName] = useState<string>("Your Event Name");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("Your Event Description");
    const [updatedTags, setUpdatedTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const [submissionStatus, setSubmissionStatus] = useState<string>("");
    const [currLatitude, setLatitude] = useState<number>(0);
    const [currLongitude, setLongitude] = useState<number>(0);
    const [options, setOptions] = useState<LocationProps[]>([]);
    // updatedAddress is the address inputted into the input box on the form
    const [updatedAddress, setAddress] = useState<string>("");
    // updatedInAddress stores the address from the JSON returned by the API request
    const [updatedInAddress, setInAddress] = useState<string>("");

    // The CSS State Variables
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();


    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    // Make all inputtables empty on Organization page
    const clearEvent = () => {
        setUpdatedName("Your Event Name");
        setUpdatedDate(new Date);
        setUpdatedDescription("Your Event Description");
        setUpdatedTags(Array(EventTags.length).fill(false));
        setLatitude(0);
        setLongitude(0);
        setInAddress("");
        setAddress("");
        setIsEditingName(false);
        setIsEditingDescription(false);
        setSubmissionStatus("Cleared!");
    }

    // Checks if all inputtables are non-empty
    const notEmpty = () => {
        return ((updatedName != "Your Event Name") &&
                (updatedDescription != "Your Event Description") &&
                (updatedTags.includes(true)) &&
                ((currLatitude != 0) && (currLongitude != 0)))
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
                            coordinates: [currLongitude, currLatitude]
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
                if (updatedName == "Your Event Name") {
                    errs = errs + "Name ";
                }
                if (updatedDescription == "Your Event Description") {
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
                    getLocationJSON(query);
                    setOptions([]);
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
        console.log('called!', address);
        // Convert address to url (aka add +'s in every space)
        const convertedAddress = address.trim().replaceAll(" ", "+");
        const url = "https://nominatim.openstreetmap.org/search?q=" + convertedAddress + "&format=json";
        
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
            const data = response.data;
            if (data.length > 0) {
                if (data.length > 1) {
                    const internals = data;
                    setInAddress(internals.display_name);
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                    setOptions(data);
                }
                // Single address returned
                else {
                    const internals = data[0];
                    setInAddress(internals.display_name);
                    setOptions([]);
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                }
            }
            else {
                setInAddress("Invalid Address");
                setSubmissionStatus("Error: Invalid Address");
                setLatitude(0);
                setLongitude(0);
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    return ( 
        <div className="box">
            <div className="left">
                <h3>
                    left side
                </h3>
            </div>
            <div className="right">
                <div className="goToTheRight">
                        <button className="tagPillSelected" onClick={handleSubmit}>
                            Publish
                        </button>
                        
                        {/* <button className="tagPillNotSelected" onClick={clearEvent}>
                            Clear
                        </button> */}
                </div>

                {/* <div className="graybox">
                    <h3>
                        {submissionStatus}
                    </h3>
                </div> */}


                <div className="graybox" onClick={()=>setIsEditingName(true)}>
                    {
                        isEditingName ? 
                        <textarea onKeyDown={(e)=> {
                            if (e.key === "Enter") {
                                setIsEditingName(false)
                            }
                            }} className="titleinputbox" name="name" placeholder="Name" value={updatedName} onChange={(event) => { setUpdatedName(event.target.value) }} 
                        />
                        : 
                        <div className="titleinputbox">{updatedName}</div>
                    }
                </div>

                <div className="graybox spacing">
                    <div className="orgLogo">
                        <img src={TestLogo.src} />
                    </div>
                    <div className="flexIt">
                        <h3>
                            Hosted by <u>{orgName}</u>:
                        </h3>
                    </div>
                    <div className="goToTheRight">
                        <button className="tagPillNotSelected">
                            Edit
                        </button>
                    </div>
                </div>

                <div className="graybox">
                    <input type="date" name="date" placeholder="Date" value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''} onChange={(event) => { setUpdatedDate(new Date((event.target as HTMLInputElement).value)) }} />
                </div>
                
                <h3>
                    <b>
                        Description:
                    </b>
                </h3>

                <div className="columngraybox" onClick={() => setIsEditingDescription(true)}>
                    {
                        isEditingDescription ? 
                        <textarea onKeyDown={(e)=> {
                            if (e.key === "Enter") {
                                setIsEditingDescription(false)
                            }
                            }} className="inputbox" name="description" placeholder="Description" value={updatedDescription} onChange={(event) => { setUpdatedDescription(event.target.value) }} 
                        />
                        : 
                        <div className="inputbox">{updatedDescription}</div>
                    }
                </div>
                
                <div className="columngraybox">
                    <div className="columngraybox">
                        <textarea className="inputbox" onChange={(e)=>{
                            if (timeoutID) {
                                clearTimeout(timeoutID);
                            }
                            setAddress(e.target.value);
                            let newTimeoutID = setTimeout(() => getLocationJSON(e.target.value), 500);
                            setTimeoutID(newTimeoutID);
                        }} name="location" placeholder="Location" value={updatedAddress} 
                        />
                    </div>
                    <div className="searchOptionsParent">
                        <div className="searchOptions">
                            {
                                options.map((option, index) => (
                                    <button key={index}
                                    onClick={() => {
                                        setLatitude(parseFloat(option.lat));
                                        setLongitude(parseFloat(option.lon));
                                        setInAddress(option.display_name);
                                        setAddress(option.display_name);
                                        setOptions([]);
                                    }}>
                                        { option.display_name }
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="graybox">

                </div>

                {/* <button onClick={()=>getLocationJSON(updatedAddress)}>
                    Get Address Info
                </button> 
                <button onClick={()=>{getUserLocation()}}>
                    Get Address from Current Location
                </button> 
                <h3>Address: {updatedInAddress}</h3>
                <h3>Latitude: {currLatitude}</h3>
                <h3>Longitude: {currLongitude}</h3> */}

                <h3>
                    <b>
                        Select Keywords:
                    </b>
                </h3>
                <div className="tagOptions">
                    {
                        EventTags.map((tagName, index) => {
                            return (
                                <button 
                                className = { updatedTags[index] ? "tagPillSelected" :  "tagPillNotSelected" }
                                key={index} 
                                onClick={() => {
                                    const newTags = [...updatedTags];
                                    newTags[index] = !newTags[index];
                                    setUpdatedTags(newTags);
                                }}
                                >
                                    {tagName}
                                </button>
                            )
                        })
                    }
                </div>
            </div> 
        </div>
    );
}