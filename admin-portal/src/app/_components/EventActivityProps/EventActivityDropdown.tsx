import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../_interfaces/AuthInterfaces';
import { Activity } from "../../_interfaces/EventInterfaces";
import Image from 'next/image'
import { drop_down, drop_up } from '../../../../public/EventActivities/EventActivities-index'
import ActivityCard from "./ActivityCard";
import '../../_styles/EventActivityDropDown.css';

interface EventActivityDropDownProps {
    activityTitle: string;
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    ContentComponent: React.ComponentType<any>;
}

export default function EventActivityDropdown({ activityTitle, activities, setActivities, isExpanded, setIsExpanded, ContentComponent }: EventActivityDropDownProps) {
    return (
        <div className="dropdown-parent">
            <div className="activity-grandparent">
                <div className="activity-header-row">
                    <div className="activity-title-count-parent">
                        <div className="activity-title-text">{activityTitle}</div>
                        <div className="activity-count">
                            {activities.length}
                        </div>
                    </div>
                    <div className="activity-button-dropdown">
                        <div className="add-button">
                            + ADD
                        </div>
                        <div className="drop_down" onClick={() => {setIsExpanded(false)}}>
                            <Image src={drop_up} alt="Drop Up Icon" width={18} height={42} />
                        </div>
                    </div>
                </div>
                <div className="activity-card-container">
                    {activities.map((a) => (
                        <div key={a._id}>
                            <ActivityCard 
                                activity={a} 
                                ContentComponent={ContentComponent}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="divider"/>
        </div>
    )
}