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
    const [currLatitude, setLatitude] = useState<number>(0);
    const [currLongitude, setLongitude] = useState<number>(0);
    const [options, setOptions] = useState<LocationProps[]>([]);
    const [updatedAddress, setAddress] = useState<string>("");
    // A state variable I used to debug Nominatim Issues. Can be useful for notifications
    const [submissionStatus, setSubmissionStatus] = useState<string>("");

    // The CSS State Variables
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    // This timer will start when the user stops typing and reset once the user starts typing again
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

    const getDayOfWeek = (d: Date) => {
        const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
        return days[d.getDay()];
    }

    const getMonth = (d: Date) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
          return months[d.getMonth()];
    }

    // Date object store dates under the assumption of array accesses, which means last days of the months overflow
    // This function fixes that, aka: March 32 --> April 1, and so on
    const parseDate = (d: Date) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const leapYearDaysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const month = d.getMonth();
        const year = d.getFullYear();
        var date = d.getDate();
        
        // Leap Year
        if (year % 4 == 0) {
            ((date) >= leapYearDaysInMonth[month]) ? (date = 1) : (date += 1)
        }
        else {
            ((date) >= daysInMonth[month]) ? (date = 1) : (date += 1)
        }

        return new Date(year, month, date);;
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
                // Multiple addresses returned
                if (data.length > 1) {
                    const internals = data;
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                    setOptions(data);
                }
                // Single address returned
                else {
                    const internals = data[0];
                    setOptions([]);
                    setLatitude(internals.lat);
                    setLongitude(internals.lon);
                }
            }
            // No address returned
            else {
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
                {/* Publish Button */}
                <div className="goToTheRight">
                    <button className="tagPillSelected clickable" onClick={handleSubmit}>
                        Publish
                    </button>
                </div>

                {/* Event Name */}
                <div className="graybox clickable" onClick={()=>setIsEditingName(true)}>
                    {
                        // If is editing, then put in a textbox. If not, then its plain text
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
                
                {/* Organization Info */}
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
                        <button className="tagPillNotSelected clickable">
                            Edit
                        </button>
                    </div>
                </div>

                {/* Date, Time, Timezone */}
                <div className="graybox dateRow">
                    <div className="graybox overlapInput">
                        <div 
                            className="flexIt dateRow clickable"
                            onClick={() => (document.getElementById('hiddenDateInput') as HTMLInputElement).showPicker()}
                        >
                            <div>{getDayOfWeek(updatedDate)}</div>
                            <div>{getMonth(updatedDate)}</div>
                            <div>{ updatedDate.getDate()}</div>
                        </div>
                    
                        {/* Hidden Date Input Interface, only the input modal appears when clicked */}
                        <input
                            type="date"
                            id="hiddenDateInput"
                            className="hiddenDateModal flexIt"
                            value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''}
                            onChange={(event) => { setUpdatedDate(parseDate(new Date((event.target as HTMLInputElement).value))); console.log(updatedDate);}}
                            />
                    </div>
                    <div className="flexIt">
                        
                    </div>
                </div>
                
                {/* Description */}
                <div className="flexIt">
                    <div className="flexIt">
                        <b>
                            Description:
                        </b>
                    </div>

                    <div className="columngraybox clickable flexIt" onClick={() => setIsEditingDescription(true)}>
                        {
                            // If is editing, then put in a textbox. If not, then its plain text
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
                </div>
                
                {/* Location */}
                <div className="columngraybox flexIt">
                    <div className="columngraybox flexIt">
                        <textarea className="inputbox clickable" onChange={(e)=>{
                            // If an existing timeout exists, kill it (because we're going to set a new one)
                            if (timeoutID) {
                                clearTimeout(timeoutID);
                            }
                            setAddress(e.target.value);
                            let newTimeoutID = setTimeout(() => getLocationJSON(e.target.value), 500);
                            setTimeoutID(newTimeoutID);
                        }} name="location" placeholder="Location" value={updatedAddress} 
                    />
                    </div>
                    {/* If multiple results return, this is the modal that pops up */}
                    <div className="searchOptionsParent">
                        <div className="searchOptions clickable">
                            {
                                options.map((option, index) => (
                                    <button key={index}
                                    onClick={() => {
                                        setLatitude(parseFloat(option.lat));
                                        setLongitude(parseFloat(option.lon));
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

                {/* Keyword Buttons */}
                <div>
                    <div className="flexIt">
                        <b>
                            Select Keywords:
                        </b>
                    </div>
                    <div className="tagOptions flexIt">
                        {
                            EventTags.map((tagName, index) => {
                                return (
                                    <button 
                                    className = { updatedTags[index] ? "tagPillSelected clickable" :  "tagPillNotSelected clickable" }
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
        </div>
    );
}