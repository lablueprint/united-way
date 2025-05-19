"use client";

import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import { LocationProps, EventTags, EventData } from "../_interfaces/EventInterfaces";
import Image from 'next/image'
import AddTagsModal from "./AddTagsModal";
import { add_photo, down_arrow, draft, hero, right_arrow } from '../../../public/BetterEventEditor/BetterEventEditor-index'
import '../_styles/BetterEventEditor.css';

interface EventEditorProps {
    orgName: string;
    justCreated: boolean;
}

export default function BetterEventEditor() {
    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [options, setOptions] = useState<LocationProps[]>([]);
    const [address, setAddress] = useState<string>("");
    const [tags, setTags] = useState<boolean[]>(Array(EventTags.length).fill(false));
    const selectedTagColors = ["tag-selected-red", "tag-selected-salmon", "tag-selected-yellow"];

    const [isEditingEventTitle, setIsEditingEventTitle] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
    const [isDisplayingTagModal, setIsDisplayingTagModal] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken }})

    useEffect(() => {
        // If an input is followed by a div, make the button open the picker
        document.querySelectorAll("div").forEach((div) => {
            div.addEventListener("click", (event) => {
                const input = (event.currentTarget as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                if (input?.tagName === "INPUT" && 'showPicker' in input) {
                    input.showPicker();
                }
            });
        });
    }, []);

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
            setImageFile(file);
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
        console.log("Image upload token:", org.authToken);
        const formData = new FormData();
        formData.append("image", file);
        const response = await axios.post(
            `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}/addImage`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${org.authToken}`,
                    "Content-Type": "multipart/form-data"
                },
            }
        );
        console.log("Image upload response:", response.data);
        return response.data.imageUrl;
    };
    
    return (
        <div>
            {/* Events header */}
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
            {/* Editor Body */}
            <div className="editor-body-parent">
                <div className="draft-save-publish-indicators">
                    <div className="draft-indicator">
                        <div className="draft-indicator-logo"><Image src={draft} alt="Draft Icon" width={24} height={24} /></div>
                        <div className="draft-indicator-text">DRAFT</div>
                    </div>
                    <div className="save-publish-parent">
                        <div className="save-button">Save</div>
                        <div className="publish-button">Publish</div>
                    </div>
                </div>

                <div className="event-editor-interface">
                    <div className="image-editor-and-tags">
                        {/* This setup creates a hidden input that's triggered by clicking the label */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="imageUpload"  // This ID connects the input to the label
                        />
                        {
                            image ?
                                <label htmlFor="imageUpload" className="image-editor-with-image">
                                    <div className="add_photo-image-with-image">
                                        <Image src={image} alt="Add Photo Icon" width={513} height={450} />
                                    </div>
                                </label>
                            :
                            <label htmlFor="imageUpload" className="image-editor">
                                <label htmlFor="imageUpload" className="add-photo-parent"> 
                                    <div className="add_photo-image">
                                        <Image src={add_photo} alt="Add Photo Icon" width={60} height={60} />
                                    </div>
                                    <div className="add_photo-subtitle">
                                        Upload Images Here
                                    </div>
                                </label>
                            </label>
                        }
                        <div className="tags-title">
                            SELECT KEYWORDS
                        </div>
                        <div className="tags-parent">
                            <div className="tags-container">
                                {
                                    isDisplayingTagModal ?
                                    (<AddTagsModal tags={tags} setTags={setTags} setIsDisplayingTagModal={setIsDisplayingTagModal} />)
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
                            <div className="add-tag-button" onClick={() => {setIsDisplayingTagModal(true)}}>
                                + ADD TAG
                            </div>
                        </div>
                    </div>
                    <div className="event-detail-fields">
                        <div className="event-title-and-org">
                            <div className="event-name-title">EVENT NAME</div>
                            <div onClick={() => setIsEditingEventTitle(true)}>
                                {
                                    isEditingEventTitle ? 
                                    <textarea
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {setIsEditingEventTitle(false)}
                                        }}
                                        onBlur={() => { setIsEditingEventTitle(false); }}
                                        className="event-title-editor-card" name="eventTitle" placeholder="TITLE" value={eventTitle} onChange={(event) => {setEventTitle(event.target.value)}}
                                    />
                                    :
                                    <div className="event-title-editor-card">{eventTitle.length == 0 ? (<div className="event-title-editor-card-empty">TITLE</div>) : eventTitle}</div>
                                }
                            </div>
                            <div className="organization-card-parent">
                                <div className="org-logo"><Image src={hero} alt="Hero Icon" width={28} height={28} /></div>
                                <div className="org-info">
                                    Hosted by
                                    <div className="org-name">United Way</div>
                                </div>
                            </div>
                        </div>
                        <div className="time-card-parent">
                            <div className="event-date">Wed, January 22 </div>
                            <div className="start-end-time">
                                0:00 – 0:00
                            </div>
                            <div>•</div>
                            <div className="timezone">PT</div>
                            <div className="down_arrow"><Image src={down_arrow} alt="Down Arrow Icon" width={10} height={10} /></div>
                        </div>
                        <div className="description-location-attendees">
                            <div className="description-parent">
                                <div className="description-title">DESCRIPTION</div>
                                <div onClick={() => setIsEditingDescription(true)}>
                                    {
                                        isEditingDescription ? 
                                        <textarea
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {setIsEditingDescription(false)}
                                            }}
                                            onBlur={() => { setIsEditingDescription(false); }}
                                            className="description-body" name="description" placeholder="Description" value={eventDescription} onChange={(event) => {setEventDescription(event.target.value)}}
                                        />
                                        :
                                        <div className="description-body">{eventDescription.length == 0 ? (<div className="description-body-empty">Description</div>) : eventDescription}</div>
                                    }
                                </div>
                            </div>
                            <div className="location-parent">
                                <div className="location-title">ADDRESS</div>
                                <div onClick={() => setIsEditingLocation(true)}>
                                    {
                                        isEditingLocation ? 
                                        <textarea
                                            onChange={(e) => {
                                                // If an existing timeout exists, kill it (because we're going to set a new one)
                                                if (timeoutID) {
                                                    clearTimeout(timeoutID);
                                                }
                                                setAddress(e.target.value);
                                                const newTimeoutID = setTimeout(() => getLocationJSON(e.target.value), 500);
                                                setTimeoutID(newTimeoutID);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {setIsEditingLocation(false)}
                                            }}
                                            onBlur={() => { setIsEditingLocation(false); }}
                                            className="location" name="location" placeholder="Location" value={address}
                                        />
                                        :
                                        <div className="location">{address.length == 0 ? (<div className="location-empty">Location</div>) : address}</div>
                                    }
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
                                                        setAddress(option.display_name);
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
            </div>
        </div>
    )
}