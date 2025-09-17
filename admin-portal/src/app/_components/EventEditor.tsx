"use client";

import axios, { AxiosResponse } from "axios";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { add_photo, calendar, clock, down_arrow, draft, hero, person, right_arrow } from '../../../public/EventEditor/EventEditor-index';
import { EventTags, LocationProps } from "../_interfaces/EventInterfaces";
import '../_styles/EventEditor.css';

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

import ActivityDropdown from "./ActivityDropdown";
import TagModal from "./TagModal";

interface EventEditorProps {
    eventId: string;
    justCreated: boolean;
}

export default function EventEditor({ eventId, justCreated = false }: EventEditorProps): React.ReactElement {
    const router = useRouter();
    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [eventAttendeesCount, setEventAttendeesCount] = useState<number>(0);
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [options, setOptions] = useState<LocationProps[]>([]);
    const [address, setAddress] = useState<string>("");
    const [tags, setTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const selectedTagColors = ["tag-selected-red", "tag-selected-salmon", "tag-selected-yellow"];
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('12:01');
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [selectedTimeZone, setSelectedTimeZone] = useState('PT');
    const [isDraft, setIsDraft] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();

    const [isEditingEventTitle, setIsEditingEventTitle] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
    const [isDisplayingTagModal, setIsDisplayingTagModal] = useState<boolean>(false);
    const [isShowingDatePicker, setIsShowingDatePicker] = useState<boolean>(false);
    const [isShowingStartTime, setIsShowingStartTime] = useState<boolean>(false);
    const [isShowingEndTime, setIsShowingEndTime] = useState<boolean>(false);

    const [org, sendRequest] = useApiAuth();

    const dateInputRef = useRef<HTMLInputElement>(null);
    const startTimeRef = useRef<HTMLInputElement>(null);
    const endTimeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (async () => {
            const eventData = await getEventById();
            setEventTitle(eventData.name);
            setIsDraft(eventData.draft);
            setEventDescription(eventData.description);
            setEventDate(new Date(eventData.date))
            setStartTime(eventData.startTime);
            setEndTime(eventData.endTime);
            setLatitude(eventData.location.coordinates[0]);
            setLongitude(eventData.location.coordinates[1]);
            setTags(eventData.tags);
            setImage(eventData.imageURL);
            // TODO: Fix userCount PATCH
            setEventAttendeesCount(eventData.userCount ?? 0);
        })();
    }, []);

    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/events/${eventId}`, {
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

    const notEmpty = () => {
        return ((eventTitle.length > 0) &&
            (eventDescription.length > 0) &&
            ((tags.length > 0)) &&
            ((latitude != 0) && (longitude != 0)) &&
            (eventAttendeesCount > 0))
        // TODO: Add check for image upload
    }

    // When creating draft, create array of flags of "TODOs" for a given event
    // true --> not draft/complete, false --> draft
    const generateDraftList = () => {
        const currDraftList = [];

        // Event Name: 0
        currDraftList.push(eventTitle !== "");

        // Start time, end time, time zone have default vals (they aren't in draft list)

        // Description: 1
        currDraftList.push(eventDescription !== "");

        // Location: 2
        currDraftList.push(((latitude != 0) && (longitude != 0)));

        // Tags: 3
        currDraftList.push((tags.length != 0));

        // TODO: When implemented, add flag for event photo

        return currDraftList
    }

    const handleCancel = async () => {
        if (justCreated) {
            const endpoint = `events/${eventId}`;
            const requestType = RequestType.DELETE;
            const body = {};
            await sendRequest({ endpoint, requestType, body });
        }
        router.back();
    }

    // TODO: maybe refresh to populate the event into org upon successful patch?
    // TODO: Update schema to handle user count?
    // Creates a JSON and attempts to patch it to DB
    const handlePatch = async (currIsDraft: boolean) => {
        try {
            // TODO: Convert to GMT, figure out how things are stored
            if ((notEmpty() && !currIsDraft) || currIsDraft) {
                const selectedTags = tags
                    .map((isSelected, index) => isSelected ? EventTags[index] : null)
                    .filter(tag => tag !== null);

                const uploadDraftList = generateDraftList()

                const endpoint = `events/${eventId}`;
                const body = {
                    name: eventTitle,
                    date: eventDate,
                    duration: 0, // Hardcoded for now
                    draft: currIsDraft,
                    draftList: uploadDraftList,
                    description: eventDescription,
                    startTime: startTime,
                    endTime: endTime,
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    organizerID: org.orgId,
                    tags: selectedTags,
                    registeredUsers: [], // Hardcoded for now
                    activity: [], // Hardcoded for now
                    imageURL: image,
                    userCount: eventAttendeesCount,
                }
                const requestType = RequestType.PATCH;
                await sendRequest({ requestType, body, endpoint });
                router.push('/events');
            }
            else {
                console.warn("Upload Failure: Empty Arguments")
            }
        } catch (err) {
            console.log(err);
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
                setLatitude(0);
                setLongitude(0);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            // Upload the image
            const imageUrl = await uploadOrgImage(file);
            console.log("Uploaded image URL:", imageUrl);
            setImage(imageUrl);
        }
    };

    const uploadOrgImage = async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await axios.post(
            `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/orgs/${org.orgId}/addImage`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${org.authToken}`,
                    "Content-Type": "multipart/form-data"
                },
            }
        );
        return response.data.imageUrl;
    };

    function formatToAMPM(d: Date): string {
        const date = new Date(d);

        let hours = date.getHours();
        const minutes = date.getMinutes();

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutesStr} ${ampm}`;
    }

    const formatDate = (date: Date | null): string => {
        if (!date) return '--/--/----';

        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    }

    const formatTimeToAMPM = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div>
            <div className="event-header">
                <div className="event-header-info">
                    <div className="event-directory-path">
                        <div>Home</div>
                        <div className="right-arrow"><Image src={right_arrow} alt="Right Arrow Icon" width={8} height={13} /></div>
                        <div>Events</div>
                        <div className="right-arrow"><Image src={right_arrow} alt="Right Arrow Icon" width={8} height={13} /></div>
                        <div className="event-directory-path-eventname">{eventTitle.length == 0 ? "Untitled Event" : eventTitle}</div>
                    </div>
                </div>
                <div className="event-header-events-title">EVENTS</div>
                <div className="event-header-events-subtitle">
                    View current, published, past, and event drafts.
                </div>
            </div>
            <div className="event-editor-main">
                {/* Events header */}

                <div className="draft-save-publish-indicators">
                    <div className="draft-indicator">
                        <div className="draft-indicator-logo"><Image src={draft} alt="Draft Icon" width={18} height={18} /></div>
                        <div className="draft-indicator-text">DRAFT</div>
                    </div>
                    <div className="cancel-save-publish-parent">
                        <button
                            className="cancel-button"
                            onClick={handleCancel}
                        >
                            CANCEL
                        </button>
                        <div className="save-button" onClick={() => { handlePatch(true) }}>SAVE</div>
                        <div className="publish-button" onClick={() => { handlePatch(false) }}>PUBLISH</div>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="event-editor-interface">
                    <div className="image-editor-and-tags">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="imageUpload"
                        />

                        {/* Single label toggles between two views */}
                        <label htmlFor="imageUpload" className={image ? "image-editor-with-image" : "image-editor"}>
                            {image ? (
                                <div className="add_photo-image-with-image">
                                    <Image src={image} alt="Uploaded Image" width={570} height={500} />
                                </div>
                            ) : (
                                <div className="add-photo-parent">
                                    <div className="add_photo-image">
                                        <Image src={add_photo} alt="Add Photo Icon" width={60} height={60} />
                                    </div>
                                    <div className="add_photo-subtitle">Upload Images Here</div>
                                </div>
                            )}
                        </label>
                    </div>
                    <div className="event-detail-fields">
                        <div className="event-title-and-org">
                            <div className="event-editor-field-title">EVENT NAME</div>
                            <div
                                className={`event-title-editor-card`}
                                contentEditable
                                // suppressContentEditableWarning
                                onInput={(e) => setEventTitle(e.currentTarget.textContent)}
                                onBlur={(e) => {
                                    if (e.currentTarget.textContent.trim() === "") {
                                        setEventTitle("");
                                    }
                                }}
                                data-placeholder="Title"
                            />
                            <div className="organization-attendees-grandparent">
                                <div className="org-box-parent">
                                    <div className="org-logo"><Image src={hero} alt="Hero Icon" width={28} height={28} /></div>
                                    <div className="org-info">
                                        Hosted by
                                        <div className="org-name">Place-holder name</div>
                                    </div>
                                </div>
                                <div className="attendees-parent">
                                    <div className="attendees-image-and-title">
                                        <div className="attendees-image"><Image src={person} alt="Attendees Icon" width={15} height={17} /></div>
                                        <div className="attendees-box-title">MAX ATTENDEES</div>
                                        <div className="date-box-vertical-bar" />
                                    </div>
                                    <div className="attendees-counter">
                                        <div className="attendees-plus-minus" onClick={() => { setEventAttendeesCount(Math.max(eventAttendeesCount - 1, 0)) }}>–</div>
                                        <div className="attendees-count">{eventAttendeesCount}</div>
                                        <div className="attendees-plus-minus" onClick={() => { setEventAttendeesCount(eventAttendeesCount + 1) }}>+</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="date-time-grandparent">
                            <div className="date-box-parent">
                                <div className="date-image-and-title">
                                    <div className="calendar-image"><Image src={calendar} alt="Calendar Icon" width={15} height={17} /></div>
                                    <div className="date-box-title">DATE</div>
                                    <div className="date-box-vertical-bar" />
                                </div>
                                <div className="date-box-date-and-down"
                                    onClick={() => {
                                        dateInputRef.current?.showPicker();
                                        setIsShowingDatePicker(true);
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent focus from being lost
                                    }}>
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        onChange={(e) => setEventDate(new Date(e.target.value))}
                                        className="date-input"
                                        value={eventDate.toISOString().split('T')[0]}
                                        onBlur={() => setIsShowingDatePicker(false)}
                                    />
                                    <div className="down_arrow">
                                        <Image src={down_arrow} alt="Down Arrow Icon" width={15} height={15} />
                                    </div>
                                </div>
                            </div>
                            <div className="time-box-parent">
                                <div className="time-image-and-title">
                                    <div className="clock-image"><Image src={clock} alt="Clock Icon" width={15} height={17} /></div>
                                    <div className="time-box-title">TIME</div>
                                    <div className="date-box-vertical-bar" />
                                </div>
                                <div className="time-box-time-and-down"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('time-display')) {
                                            !isShowingStartTime ? startTimeRef.current?.showPicker() : endTimeRef.current?.showPicker();
                                            setIsShowingStartTime(!isShowingStartTime);
                                        }
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}>
                                    <div className="time-display">{`${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`}</div>
                                    <input
                                        ref={startTimeRef}
                                        type="time"
                                        onChange={(e) => setStartTime(e.target.value)}
                                        onBlur={() => setIsShowingStartTime(false)}
                                        className="time-input"
                                        value={startTime}
                                    />
                                    <input
                                        ref={endTimeRef}
                                        type="time"
                                        onChange={(e) => setEndTime(e.target.value)}
                                        onBlur={() => setIsShowingEndTime(false)}
                                        className="time-input"
                                        value={endTime}
                                    />
                                    <div className="down_arrow">
                                        <Image src={down_arrow} alt="Down Arrow Icon" width={15} height={15} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="description-location-attendees">
                            <div className="event-editor-field-parent">
                                <div className="event-editor-field-title">DESCRIPTION</div>
                                <div
                                    className={`event-title-editor-card`}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => setEventDescription(e.currentTarget.textContent)}
                                    onBlur={(e) => {
                                        if (e.currentTarget.textContent.trim() === "") {
                                            setEventTitle("");
                                        }
                                    }}
                                    data-placeholder="Event Description"
                                ></div>
                            </div>
                            <div className="event-editor-field-parent">
                                <div className="event-editor-field-title">ADDRESS</div>
                                <div
                                    id="event-editor-location-field"
                                    className="event-title-editor-card"
                                    contentEditable
                                    suppressContentEditableWarning
                                    data-placeholder="Location"
                                    onInput={(e) => {
                                        // debounce typing before fetching
                                        if (timeoutID) clearTimeout(timeoutID);

                                        const value = e.currentTarget.textContent;
                                        setAddress(value);

                                        const newTimeoutID = setTimeout(() => getLocationJSON(value), 500);
                                        setTimeoutID(newTimeoutID);
                                    }}
                                    onBlur={(e) => {
                                        if (e.currentTarget.textContent.trim() === "") {
                                            setAddress("");
                                            setOptions([]);
                                        }
                                    }}
                                ></div>
                                {/* If multiple results return, this is the modal that pops up */}
                                <div className="searchOptionsParent">
                                    <div className="searchOptions">
                                        {
                                            options.map((option, index) => (
                                                <button key={index}
                                                    onClick={() => {
                                                        setLatitude(parseFloat(option.lat));
                                                        setLongitude(parseFloat(option.lon));
                                                        setAddress(option.display_name);
                                                        const locationField = document.getElementById("event-editor-location-field");
                                                        locationField!.innerHTML = option.display_name
                                                        setOptions([]);
                                                    }}>
                                                    {option.display_name}
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="tags-title">
                        SELECT KEYWORDS
                    </div>
                    <div className="tags-parent">
                        <div className="tags-container">
                            {
                                isDisplayingTagModal ?
                                    (<TagModal tags={tags} setTags={setTags} setIsDisplayingTagModal={setIsDisplayingTagModal} />)
                                    :
                                    EventTags.map((_, index) => {
                                        return (
                                            tags[index] ?
                                                <div
                                                    className={selectedTagColors[(index) % 3]}
                                                    key={index}>
                                                    {EventTags[index]}
                                                </div>
                                                :
                                                <React.Fragment key={index}></React.Fragment>
                                        )
                                    })
                            }
                        </div>
                        <div className="add-tag-button" onClick={() => { setIsDisplayingTagModal(true) }}>
                            + ADD TAG
                        </div>
                    </div>
                </div>
                <ActivityDropdown eventId={eventId} isDraft={true} />
            </div>
        </div>
    )
}