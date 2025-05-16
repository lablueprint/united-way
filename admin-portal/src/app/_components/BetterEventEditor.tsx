import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import { LocationProps, EventTags, EventData } from "../_interfaces/EventInterfaces";
import Image from 'next/image'
import { add_photo, banner, down_arrow, draft, hero, right_arrow, user } from '../../../public/BetterEventEditor/BetterEventEditor-index'
import '../_styles/BetterEventEditor.css';

interface EventEditorProps {
    orgName: string;
    justCreated: boolean;
}

export default function BetterEventEditor() {
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    
    return (
        <div>
            {/* Events header */}
            <div className="event-header">
                <div className="event-header-info">
                    {/* TODO: Not hardcode this probably */}
                    <div className="event-directory-path">
                        <div>Home</div>
                        <div className="right-arrow"><Image src={right_arrow} alt="Right Arrow Icon" width={8} height={13} /></div>
                        <div>Events</div>
                        <div className="right-arrow"><Image src={right_arrow} alt="Right Arrow Icon" width={8} height={13} /></div>
                        <div className="event-directory-path-eventname">Untitled Page</div>
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
                        <div className="image-editor">
                            <div className="add_photo">
                                <Image src={add_photo} alt="Add Photo Icon" width={131} height={131} />
                            </div>
                        </div>
                        <div className="tags-parent">
                            <div className="tags-title">
                                Select Keywords
                            </div>
                            {/* TODO: Add the button stuffs */}
                        </div>
                    </div>
                    <div className="event-detail-fields">
                        <div className="event-title-and-org">
                            <div className="event-title-editor-card">
                                TITLE
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
                                <div className="description-title">
                                    Description
                                </div>
                                <div className="description-body">
                                    Lorem ipsum dolor sit amet consectetur. Laoreet in venenatis non et. Nibh a duis in mattis tempus scelerisque auctor. At et vel purus id nisl posuere. Nec dictumst sollicitudin luctus vitae.

                                    Lorem ipsu
                                </div>
                            </div>
                            <div className="location">
                                1113 Murphy Hall, Los Angeles CA
                            </div>
                            <div className="attendees-parent">
                                Maximum Attendees + 1 -
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}