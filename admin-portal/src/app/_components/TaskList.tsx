import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import { EventData } from '../_interfaces/EventInterfaces'

import Image from 'next/image'
import pencil from '../_styles/_images/border_color.svg';
import publish from '../_styles/_images/publish.svg';
import location from '../_styles/_images/location_on.svg';
import '../_styles/TaskList.css';

import useApiAuth from '../_hooks/useApiAuth';
import { RequestType } from '../_interfaces/RequestInterfaces';


export default function TaskList() {
    const [draftCount, setDraftCount] = useState<number>(0);
    const [allDrafts, setAllDrafts] = useState<EventData[]>();
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    const sendRequest = useApiAuth();

    // Load in all drafts, draftCount on rendering TaskList
    useEffect(() => {
        (async () => {
            const eventData = await getOrganizerDrafts();
            setDraftCount(eventData?.length || 0);
            setAllDrafts(eventData);
        })();
    }, [])

    const getOrganizerDrafts = async () => {
        try {
            const endpoint = "events/filtered";
            const requestType = RequestType.POST;
            const body = {
                organizerID: org.orgId,
                draft: true
            }
            const data = await sendRequest({ requestType, body, endpoint });
            return data;
        }
        catch (err) {
            console.log(err);
        }
    }

    const getMonthString = (d: Date) => {
        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        return months[d.getMonth()];
    }

    const getTimeString = (t: string) => {
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
            return ((parseInt(hours) - 12) + ':' + minutes + ' PM');
        }
    }

    return (
        <div className="draft-task-list">
            <div className="header-box-parent">
                <div className="header-box-text">
                    DRAFTS
                </div>
                <div className="header-box-count">
                    {draftCount}
                </div>
            </div>

            {/* Iterate through Draft List. If there are TODO's to complete, display them*/}
            {allDrafts?.map((draft: EventData) => {
                const draftList = draft.draftList
                const draftDate = new Date(draft.date)
                const dateString = getMonthString(draftDate) + " " + draftDate.getDate() + "  |  " + getTimeString(draft.startTime) + " - " + getTimeString(draft.endTime)

                return (
                    <div className="draft-task-list" key={draft._id}>
                        <div className="draft-box-parent">
                            <div className="draft-box-information">
                                <div className="draft-title">
                                    {draft.name.toUpperCase()}
                                </div>
                                <div className="bullet-divider">•</div>
                                <div className="draft-time">
                                    {dateString}
                                </div>
                                <div className="bullet-divider">•</div>
                                {/* TODO: Nominatim does not return cities, so this is hardcoded for our use case*/}
                                <div className="draft-location">
                                    LOS ANGELES, CA
                                </div>
                            </div>
                        </div>
                        {/* TODO: Add Rewards, poster/flyer, start time, finish time, and date */}
                        {/* Hardcode Tasks based on draftList index */}
                        <div className="task-list-grandparent">
                            {/* Missing Event Name */}
                            {!draftList[0] && (
                                <div className="task-list-parent">
                                    <div className="task-image">
                                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                                    </div>
                                    <div className="task-text">
                                        Add a title
                                    </div>
                                </div>
                            )}

                            {/* Missing Description */}
                            {!draftList[1] && (
                                <div className="task-list-parent">
                                    <div className="task-image">
                                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                                    </div>
                                    <div className="task-text">
                                        Add a description
                                    </div>
                                </div>
                            )}

                            {/* Missing Location */}
                            {!draftList[2] && (
                                <div className="task-list-parent">
                                    <div className="task-image">
                                        <Image src={location} alt="Location icon" width={19} height={22} />
                                    </div>
                                    <div className="task-text">
                                        Add a location
                                    </div>
                                </div>
                            )}

                            {/* Missing tags */}
                            {!draftList[3] && (
                                <div className="task-list-parent">
                                    <div className="task-image">
                                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                                    </div>
                                    <div className="task-text">
                                        Select tags for your event
                                    </div>
                                </div>
                            )}

                            {/* If everything is done, Publish! */}
                            {!draftList.includes(false) && (
                                <div className="task-list-parent">
                                    <div className="task-image">
                                        <Image src={publish} alt="Publish icon" width={19} height={22} />
                                    </div>
                                    <div className="task-text">
                                        Publish
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}