import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import { EventData } from '../_interfaces/EventInterfaces'

import Image from 'next/image'
import calendar from '../_styles/_images/calendar_today.svg';
import clock from '../_styles/_images/alarm.svg';
import pencil from '../_styles/_images/border_color.svg';
import publish from '../_styles/_images/publish.svg';
import location from '../_styles/_images/location_on.svg';
import trophy from '../_styles/_images/trophy.svg';
import '../_styles/TaskList.css';


export default function TaskList() {
    const [draftCount, setDraftCount] = useState<number>(0);
    const [allDrafts, setAllDrafts] = useState<EventData[]>();
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    useEffect(() => {
        console.log('allDrafts updated:', allDrafts);
    }, [allDrafts]);

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
          const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
            {
              organizerID: org.orgId,
              draft: true
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${org.authToken}`
              }
            },
          );
          const { data } = response.data;
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
                const dateString = getMonthString(draftDate) + " " +  draftDate.getDay() + "  |  " + getTimeString(draft.startTime) + " - " + getTimeString(draft.endTime)

                return (
                    <div className="draft-task-list" key={draft._id}>
                       <div className="draft-box-parent">
                            <div className="draft-box-information">
                                <div className="draft-title">
                                    { draft.name.toUpperCase() }
                                </div>
                                <div className="bullet-divider">•</div>
                                <div className="draft-time">
                                    { dateString }
                                </div>
                                <div className="bullet-divider">•</div>
                                {/* TODO: Figure out the city */}
                                <div className="draft-location">
                                    LOS ANGELES, CA
                                </div>
                            </div>
                        </div>
                        {/* TODO: Add Rewards, poster/flyer, start time, finish time, and date */}
                        {/* Hardcode Tasks based on draftList index */}

                        {/* Missing Event Name */}
                        { !draftList[0] && (
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
                        { !draftList[1] && (
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
                        { !draftList[2] && (
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
                        { !draftList[3] && (
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
                        { !draftList.includes(false) && (
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
                );
            })}
        </div>
    );
}

        // <div className="draft-task-list"> 
        //     ...
        //     <div className="draft-box-parent">
        //         ...
        //         <div className="task-list-parent">
        //             <div className="task-image">
        //                 <Image src={calendar} alt="Calendar icon" width={19} height={22} />
        //             </div>
        //             <div className="task-text">
        //                 Add a start date
        //             </div>
        //         </div>
        //         <div className="task-list-parent">
        //             <div className="task-image">
        //                 <Image src={pencil} alt="Pencil icon" width={19} height={22} />
        //             </div>
        //             <div className="task-text">
        //                 Upload a poster and flyer
        //             </div>
        //         </div>
        //         <div className="task-list-parent">
        //             <div className="task-image">
        //                 <Image src={trophy} alt="Trophy icon" width={19} height={22} />
        //             </div>
        //             <div className="task-text">
        //                 Add rewards
        //             </div>
        //         </div>
        //         <div className="task-list-parent">
        //             <div className="task-image">
        //             <Image src={clock} alt="Alarm icon" width={19} height={22} />
        //             </div>
        //             <div className="task-text">
        //                 Add a start and finish time
        //             </div>
        //         </div>
        //     </div>