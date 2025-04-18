import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventTags } from "../_interfaces/EventInterfaces";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import '../_interfaces/styles.css';
import TestLogo from "./logo.jpeg"
import PenLogo from "./pen.png"

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
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('12:01');
    const [selectedTimeZone, setSelectedTimeZone] = useState('PT');
    // A state variable I used to debug Nominatim Issues. Can be useful for notifications
    const [submissionStatus, setSubmissionStatus] = useState<string>("");

    // The CSS State Variables
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    // This timer will start when the user stops typing and reset once the user starts typing again
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    const timeZones = [
        { label: "Pacific Time (PT) America/Los Angeles", value: "PT" },
        { label: "Mountain Time (MT) America/Denver", value: "MT" },
        { label: "Central Time (CT) America/Chicago", value: "CT" },
        { label: "Eastern Time (ET) America/New York", value: "ET" },
    ];

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

    const getTimeString = (t:string) => {
        const [hours, minutes] = t.split(":");
        if (parseInt(hours) == 0) {
            return ('12:' + minutes + ' AM');
        }
        else if (parseInt(hours) == 12) {
            return ('12:' + minutes + ' PM');
        }
        else if (parseInt(hours) <= 11) {
            return (hours + ':' + minutes + 'AM');
        }
        else {
            return ((parseInt(hours) - 12) + ':' + minutes + 'PM');
        }
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
            console.log('date ', updatedDate);
            console.log('starttime ', startTime);
            console.log('tz', selectedTimeZone);
            // TODO: Convert to GMT, figure out how things are stored
            if (notEmpty()) {
                const selectedTags = updatedTags
                    .map((isSelected, index) => isSelected ? EventTags[index] : null)
                    .filter(tag => tag !== null);
                
                const response: AxiosResponse = await axios.post(
                    `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/createEvent`,
                    {
                        name: updatedName,
                        date: updatedDate,
                        startTime: startTime,
                        endTime: endTime,
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
            {/* The left side */}
            <div className="left">
                {/* Image selection */}
                <div style={{display: 'flex', flexDirection: 'column', width: "90%", height: "90%", justifyContent: "center", alignItems: "center"}}>
                    <div className="imagebox">
                        <img className="penlogo clickable" src={PenLogo.src} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', width: "80%", rowGap:"0.7em", marginTop: "1.4em"}}>
                        <div className="flexIt">
                            <h3>
                                <b>
                                    Customize your Event!
                                </b>
                            </h3>
                        </div>
                        {/* row-gap, col-gap */}
                        <div style={{display: 'flex', columnGap: "5%"}}> 
                            <button style={{color:"white", fontSize:"0.8em", fontWeight:"bold", borderStyle:"hidden", borderRadius:"3px", backgroundColor: "black", height:"3em", width:"10em"}}>
                                Add Poll
                            </button>
                            <button style={{color:"white", fontSize:"0.8em", fontWeight:"bold", borderStyle:"hidden", borderRadius:"3px", backgroundColor: "black", height:"3em", width:"10em"}}>
                                Add Rewards
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* The right side */}
            <div className="right">
                {/* Cancel and Publish Buttons */}
                <div className="goToTheRight">
                    <button className="tagPillSelected clickable" onClick={() =>changeState(false)}>
                        Cancel
                    </button>
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
                        {/* Date */}
                        <div 
                            className="flexIt dateRow clickable"
                            onClick={() => (document.getElementById('hiddenDateInput') as HTMLInputElement).showPicker()}
                        >
                            <div>{ getDayOfWeek(updatedDate) }</div>
                            <div>{ getMonth(updatedDate) }</div>
                            <div>{ updatedDate.getDate() }</div>
                        </div>
                    
                        {/* Hidden Date Input Interface, only the input modal appears when clicked */}
                        <input
                            type="date"
                            id="hiddenDateInput"
                            className="hiddenModal flexIt"
                            value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''}
                            onChange={(event) => { setUpdatedDate(parseDate(new Date((event.target as HTMLInputElement).value)))}}
                            />
                    </div>

                    {/* Start Time */}
                    <div className="flexIt">
                        <div 
                            className="flexIt clickable"
                            onClick={() => (document.getElementById('hiddenStartTimeInput') as HTMLInputElement).showPicker()}
                        >
                            { getTimeString(startTime) }
                        </div>
                    
                        {/* Hidden Time Input Interface */}
                        <input
                            type="time"
                            id="hiddenStartTimeInput"
                            className="hiddenModal"
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                        />
                    </div>

                    <h3>–</h3>

                    {/* End Time */}
                    <div className="flexIt">
                        <div 
                            className="flexIt clickable"
                            onClick={() => (document.getElementById('hiddenEndTimeInput') as HTMLInputElement).showPicker()}
                        >
                            { getTimeString(endTime) }
                        </div>
                    
                        {/* Hidden Time Input Interface */}
                        <input
                            type="time"
                            id="hiddenEndTimeInput"
                            className="hiddenModal"
                            value={endTime}
                            onChange={(event) => setEndTime(event.target.value)}
                        />
                    </div>

                    <h3>•</h3>

                    {/* Time Zone */}
                    <div className="flexIt">
                        <div 
                            className="flexIt clickable"
                            onClick={() => (document.getElementById('hiddenTimeZoneInput') as HTMLInputElement).showPicker()}
                        >
                            {selectedTimeZone} 
                        </div>
                        {/* Hidden Time Zone Picker */}
                        <select 
                            id="hiddenTimeZoneInput"
                            value={selectedTimeZone}
                            className="hiddenModal"
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                setSelectedTimeZone(event.target.value);
                            }}
                        >
                            {timeZones.map((zone) => (
                                <option key={zone.value} value={zone.value}>{zone.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Description */}
                <div className="flexIt">
                    <div className="flexIt">
                        <b>
                            Description:
                        </b>  
                    </div>
                    <br/>
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
                        <textarea className="inputbox clickable noborder" onChange={(e)=>{
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