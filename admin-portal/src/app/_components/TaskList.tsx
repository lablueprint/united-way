import React, { useState, useEffect, MouseEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import Image from 'next/image'
import calendar from '../_styles/_images/calendar_today.svg';
import clock from '../_styles/_images/alarm.svg';
import pencil from '../_styles/_images/border_color.svg';
import publish from '../_styles/_images/publish.svg';
import location from '../_styles/_images/location_on.svg';
import trophy from '../_styles/_images/trophy.svg';
import '../_styles/TaskList.css';


export default function TaskList() {
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

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
        }
        catch (err) {
          console.log(err);
        }
    }


    return (
        <div className="draft-task-list"> 
            <div className="header-box-parent">
                <div className="header-box-text">
                    DRAFTS
                </div>
                <div className="header-box-count">
                    4
                </div>
            </div>
            <div className="draft-box-parent">
                <div className="draft-box-information">
                    <div className="draft-title">
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div className="bullet-divider">
                        •
                    </div>
                    <div className="draft-time">
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div className="bullet-divider">
                        •
                    </div>
                    <div className="draft-location">
                        LOS ANGELES, CA
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={calendar} alt="Calendar icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Add a start date
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Upload a poster and flyer
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={trophy} alt="Trophy icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Add rewards
                    </div>
                </div>
            </div>
            

            <div className="draft-box-parent">
                <div className="draft-box-information">
                    <div className="draft-title">
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div className="bullet-divider">
                        •
                    </div>
                    <div className="draft-time">
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div className="bullet-divider">
                        •
                    </div>
                    <div className="draft-location">
                        LOS ANGELES, CA
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                    <Image src={clock} alt="Alarm icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Add a start and finish time
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={location} alt="Location icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Add a location
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={publish} alt="Publish icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Publish
                    </div>
                </div>
                <div className="task-list-parent">
                    <div className="task-image">
                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                    </div>
                    <div className="task-text">
                        Add a title
                    </div>
                </div>
            </div>
        </div>
    );
}