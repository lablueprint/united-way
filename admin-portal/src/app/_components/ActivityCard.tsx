import React, { ReactNode } from "react";
import '../_styles/ActivityCard.css';
import Image from "next/image";
import { Activity } from "../_interfaces/EventInterfaces";
import { announcement, poll, edit, drawing, draft } from '../../../public/ActivityCard/ActivityCard-index';


const getMonthAbbreviation = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
};

interface ActivityCardProps {
    activity: Activity;
    location?: string; // optional additional prop
  }

const typeAssets = {
    poll: {
      src: poll,
      alt: 'Poll Icon',
    },
    announcement: {
      src: announcement,
      alt: 'Announcement Icon',
    },
    drawing: {
      src: drawing,
      alt: 'Drawing Icon',
    },
    draft: {
      src: draft,
      alt: "Draft Icon"
    }
  };
  
  //take in timestart 
export default function ActivityCard( {activity, location} : ActivityCardProps) {
    const asset = typeAssets[activity.type as keyof typeof typeAssets];

    const placeholderTitle = 
        activity.type === "poll"
        ? "Poll"
        : activity.type === "announcement"
        ? "Announcement"
        : activity.type === "drawing"
        ? "Drawing"
        : "Activity ";

    return(
        <div className="activityCard">
            <div className="icon">
                <Image src={asset.src} alt={asset.alt} />
            </div>
            <div className="activityInfoWrap">
                <div className="activityInfo">
                    <p className="activityTitle">{placeholderTitle}</p>
                    <div className="activityDateTime">
                        <p className="activityDate">{getMonthAbbreviation(activity.timeStart)} {activity.timeStart.getDate()}</p>
                        <p className="activityTime">
                            {activity.timeStart.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div className="activityLocation">
                        {location}
                    </div>
                </div>
                <button className="editButton lightButton">
                    <Image width={13} src={edit} alt="Pencil edit icon"/>
                </button>
            </div>
        </div>
    );
}