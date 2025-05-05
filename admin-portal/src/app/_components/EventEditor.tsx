import React, { useState, useRef, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { EventTags } from "../_interfaces/EventInterfaces";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import TestLogo from "@/../public/images/logo.jpeg"
import PenLogo from "@/../public/images/pen.png"
import QRCode from 'react-qr-code';
import '../_styles/EventEditor.css';

interface EventEditorProps {
    orgName: string;
    changeState: React.Dispatch<React.SetStateAction<boolean>>;
    eventId: string;
    justCreated: boolean;
}

interface LocationProps {
    display_name: string;
    lat: string;
    lon: string;
}

// TODO: Update the organization profile after creating this event to showcase.
export default function EventEditor({ orgName, changeState, eventId, justCreated }: EventEditorProps) {
    const [updatedName, setUpdatedName] = useState<string>("Your Event Name");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("Your Event Description");
    const [updatedTags, setUpdatedTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const [currLatitude, setLatitude] = useState<number>(0);
    const [currLongitude, setLongitude] = useState<number>(0);
    const [options, setOptions] = useState<LocationProps[]>([]);
    const address = useRef<string>("");
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('12:01');
    const [selectedTimeZone, setSelectedTimeZone] = useState('PT');
    const [isDraft, setIsDraft] = useState(true);
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

    useEffect(() => {
        (async () => {
            // Parse the event's JSON from db
            // NOTE: This pings the database twice for some reason, doesnt affect correction though, so whatevs
            // NOTE: We can ignore the draft list as we can generate a new one
            const eventData = await getEventById();
            setUpdatedName(eventData.name)
            setUpdatedDate(new Date(eventData.date))
            // We dont use Duration?
            setIsDraft(eventData.draft)
            setUpdatedDescription(eventData.description)
            setStartTime(eventData.startTime)
            setEndTime(eventData.endTime)
            setLatitude(eventData.location.coordinates[0])
            setLongitude(eventData.location.coordinates[1])
            setUpdatedTags(eventData.tags)
            // TODO: No registeredUsers, activity, image for now ... .. . ...
        })();

        if (isEditingDescription) {
            document.getElementById("description")?.focus();
        }
    }, [])

    // Checks if all inputtables are non-empty
    const notEmpty = () => {
        return ((updatedName != "Your Event Name") &&
            (updatedDescription != "Your Event Description") &&
            ((updatedTags.length > 0)) &&
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

    // When creating draft, create array of flags of "TODOs" for a given event
    // true --> not draft/complete, false --> draft
    const generateDraftList = () => {
        const currDraftList = [];
        
        // Event Name: 0
        currDraftList.push(updatedName !== "Your Event Name" && updatedName !== "");

        // Start time, end time, time zone have default vals (they aren't in draft list)
        
        // Description: 1
        currDraftList.push(updatedDescription !== "Your Event Description" && updatedDescription !== "");

        // Location: 2
        currDraftList.push(((currLatitude != 0) && (currLongitude != 0)));

        // Tags: 3
        currDraftList.push((updatedTags.length != 0));

        // TODO: When implemented, add flag for event photo

        return currDraftList
    }

    // Date object store dates under the assumption of array accesses, which means last days of the months overflow
    // This function fixes that, aka: March 32 --> April 1, and so on
    const parseDate = (d: Date) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const leapYearDaysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const month = d.getMonth();
        const year = d.getFullYear();
        let date = d.getDate();

        // Leap Year
        if (year % 4 == 0) {
            date = ((date) >= leapYearDaysInMonth[month]) ? 1 : date + 1;
        }
        else {
            date = ((date) >= daysInMonth[month]) ? 1 : date + 1;
        }

        return new Date(year, month, date);;
    }

    // TODO: maybe refresh to populate the event into org upon successful patch?
    // TODO: Update schema to handle user count?
    // Creates a JSON and attempts to patch it to DB
    const handlePatch = async (currIsDraft: boolean) => {
        try {
            // TODO: Convert to GMT, figure out how things are stored
            if ((notEmpty() && !currIsDraft) || currIsDraft) {
                const selectedTags = updatedTags
                    .map((isSelected, index) => isSelected ? EventTags[index] : null)
                    .filter(tag => tag !== null);

                const uploadDraftList = generateDraftList()

                const response: AxiosResponse = await axios.patch(
                    `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${eventId}`,
                    {
                        name: updatedName,
                        date: updatedDate,
                        duration: 0, // Hardcoded for now
                        draft: currIsDraft,
                        draftList: uploadDraftList,
                        description: updatedDescription,
                        startTime: startTime,
                        endTime: endTime,
                        location: {
                            type: "Point",
                            coordinates: [currLongitude, currLatitude]
                        },
                        organizerID: org.orgId,
                        tags: selectedTags,
                        registeredUsers: [], // Hardcoded for now
                        activity: [], // Hardcoded for now
                        image: "placeholder" // Hardcoded for now
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
                if (updatedTags.length == 0) {
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

    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${eventId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
            const { data } = response.data;
            return data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

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
                <div className="blankImage">
                    <div className="imagebox">
                        <img className="penlogo" src={PenLogo.src} />
                    </div>

                    <div className="leftBottom">
                        <div className="customizeText">
                            Customize your Event
                        </div>
                        <div className="customizeButtonFormat">
                            <button className="customizeButton">
                                Add Poll
                            </button>
                            <button className="customizeButton">
                                Add Rewards
                            </button>
                            <div style={{display: 'flex'}}>
                                <QRCode value={eventId}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* The right side */}
            <div className="right">

                {/* Cancel and Publish Buttons */}
                <div className="goToTheRight">
                    <button className="saveButton" onClick={() => {
                        handlePatch(true)
                    }}>
                        SAVE
                    </button>
                    <button className="bigPillButton" onClick={() => {
                        changeState(false)
                        // If event just created, delete the event
                        // NOTE: This is not async, might cause problems later
                        if (justCreated) {
                            try {
                                axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${eventId}`, {
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${org.authToken}`
                                    }
                                });
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    }}>
                        CANCEL
                    </button>
                    <button className="bigPillButton" onClick={() => {
                        handlePatch(false)
                    }}>
                        PUBLISH
                    </button>
                </div>

                {/* Event Name */}
                <div className="eventBox" onClick={() => setIsEditingName(true)}>
                    {
                        // If is editing, then put in a textbox. If not, then its plain text
                        isEditingName ?
                            <textarea
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setIsEditingName(false)
                                    }
                                }}
                                onBlur={() => { setIsEditingName(false); }}
                                className="titleinputbox" name="name" placeholder="Name" value={updatedName} onChange={(event) => { setUpdatedName(event.target.value) }}
                            />
                            :
                            <div className="titleinputbox">{updatedName}</div>
                    }
                </div>

                {/* Organization Info */}
                <div className="orgInfoBox">
                    <div className="orgLogo">
                        <img src={TestLogo.src} />
                    </div>
                    <div className="flexIt">
                        <h4>
                            Hosted by <u style={{ color: '#696969' }}>{orgName}</u>:
                        </h4>
                    </div>
                    <button className="editButton">
                        EDIT
                    </button>
                </div>

                {/* Date, Time, Timezone */}
                <div className="dateRow">
                    <div className="dateTimeZoneBox">
                        {/* Date */}
                        <div
                            className="date"
                            onClick={() => (document.getElementById('hiddenDateInput') as HTMLInputElement).showPicker()}
                        >
                            <div>{getDayOfWeek(updatedDate)}</div>
                            <div>{getMonth(updatedDate)}</div>
                            <div>{updatedDate.getDate()}</div>
                        </div>

                        {/* Hidden Date Input Interface, only the input modal appears when clicked */}
                        <input
                            type="date"
                            id="hiddenDateInput"
                            className="hiddenModal flexIt"
                            value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''}
                            onChange={(event) => { setUpdatedDate(parseDate(new Date((event.target as HTMLInputElement).value))) }}
                        />
                    </div>

                    <div className="timebox">
                        <input
                            type="time"
                            className="time"
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                        />

                        <div className="time">–</div>

                        <input
                            type="time"
                            className="time"
                            value={endTime}
                            onChange={(event) => setEndTime(event.target.value)}
                        />


                        <div>•</div>

                        {/* Time Zone */}
                        {/* For whatever reason, the code breaks if you remove the position: relative in-place design */}
                        <div className="time" style={{ position: 'relative' }}>
                            <select
                                className="timezone"
                                value={selectedTimeZone}
                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                    setSelectedTimeZone(event.target.value);
                                }}
                            >
                                {timeZones.map((zone) => (
                                    <option key={zone.value} value={zone.value}>{zone.label}</option>
                                ))}
                            </select>
                            <div className="clickable">
                                {selectedTimeZone}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="descriptionTitle">
                    Description:
                </div>

                <div className="clickable" onClick={() => { setIsEditingDescription(true) }} onBlur={() => setIsEditingDescription(false)}>
                    {
                        // If is editing, then put in a textbox. If not, then its plain text
                        isEditingDescription ?
                            <textarea id="description" onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setIsEditingDescription(false)
                                }
                            }} className="descriptionInputBox" name="description" placeholder="Description" value={updatedDescription} onChange={(event) => { setUpdatedDescription(event.target.value) }}
                            />
                            :
                            <div className="descriptionInputBox">{updatedDescription}</div>
                    }
                </div>

                {/* Location */}
                <div>
                    <div className="flexIt">
                        <textarea className="locationInputbox" onChange={(e) => {
                            // If an existing timeout exists, kill it (because we're going to set a new one)
                            if (timeoutID) {
                                clearTimeout(timeoutID);
                            }
                            address.current = e.target.value;
                            const newTimeoutID = setTimeout(() => getLocationJSON(e.target.value), 500);
                            setTimeoutID(newTimeoutID);
                        }} name="location" placeholder="Location" value={address.current}
                        />
                    </div>
                    {/* If multiple results return, this is the modal that pops up */}
                    <div className="searchOptionsParent">
                        <div className="searchOptions">
                            {
                                options.map((option, index) => (
                                    <button key={index}
                                        onClick={() => {
                                            setLatitude(parseFloat(option.lat));
                                            setLongitude(parseFloat(option.lon));
                                            address.current = option.display_name;
                                            setOptions([]);
                                        }}>
                                        {option.display_name}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="selectKeywordText">
                    Select Keywords:
                </div>

                {/* Keyword Buttons */}
                <div className="tagOptions flexIt">
                    {
                        EventTags.map((tagName, index) => {
                            return (
                                <button
                                    className={updatedTags[index] ? "tagPillSelected" : "tagPillNotSelected"}
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