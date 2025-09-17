import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import { Activity } from "../_interfaces/EventInterfaces";
import '../_styles/EventActivities.css';
import AnnouncementContent from "./EventActivityProps/AnnouncementContent";
import EventActivityDropdown from "./EventActivityProps/EventActivityDropdown";

interface EventActivitiesProps {
    eventID: string;
}

export default function EventActivities({ eventID }: EventActivitiesProps) {
    const [announcements, setAnnouncements] = useState<Activity[]>([]);
    const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState<boolean>(false);
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    useEffect(() => {
        const getOrganizerAnnouncement = async () => {
            try {
                const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/activities/filtered`,
                    {
                        eventID: eventID,
                        type: "announcement",
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${org.authToken}`
                        }
                    }
                );
                const { data } = response.data;
                setAnnouncements(data)
            }
            catch (err) {
                console.log(err);
            }
        }
        getOrganizerAnnouncement();
    }, [])

    return (
        <div className="border-margin">
            <EventActivityDropdown
                activityTitle="ACTIVITIES"
                activities={announcements}
                setActivities={setAnnouncements}
                isExpanded={isAnnouncementsExpanded}
                setIsExpanded={setIsAnnouncementsExpanded}
                ContentComponent={AnnouncementContent}
            />
        </div>
    )
}