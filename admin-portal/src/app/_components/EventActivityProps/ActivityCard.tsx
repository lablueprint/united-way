import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../../_interfaces/AuthInterfaces';
import { Activity } from "../../_interfaces/EventInterfaces";
import Image from 'next/image'
import { alert, menu } from '../../../../public/EventActivities/EventActivities-index'
import '../../_styles/ActivityCard.css';

interface ActivityCardProps {
    activity: Activity;
    ContentComponent: React.ComponentType<any>;
}

export default function ActivityCard({ activity, ContentComponent }: ActivityCardProps) {
    const titleSubstr = (title: string): string => {
        return title.length > 32 ? title.slice(0, 32) + '...' : title;
    }

    const getMonth = (d: Date) => {
        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        return months[d.getMonth()];
    }

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

    return (
        <div className="activity-card-parent">
            <div className="activity-header-row">
                <div className="activity-title">
                    <Image className="alert-image" src={alert} alt="Alert Icon" width={11} height={11} />
                    { activity.title ? titleSubstr(activity.title.toUpperCase()) : "UNTITLED".toUpperCase() }
                </div>
            </div>
            <div className="date-and-time">
                {`${getMonth(new Date(activity.timeStart))} ${(new Date(activity.timeStart)).getDate()}  |  ${formatToAMPM(activity.timeStart)} - ${formatToAMPM(activity.timeEnd)} PT`}
            </div>
            <ContentComponent className="activity-content" content={activity.content} />
            <div className="menu-image">
                <Image src={menu} alt="Menu Icon" width={11} height={11} />
            </div>
        </div>
    )
}