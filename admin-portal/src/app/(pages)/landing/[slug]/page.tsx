"use client";

import ActivityCard from "@/app/_components/ActivityCard";
import EventEditor from "@/app/_components/EventEditor";
import QRModal from "@/app/_components/QRModal";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import useApiAuth from '../../../_hooks/useApiAuth';
import { Activity, EventData, EventDataDefault } from '../../../_interfaces/EventInterfaces';
import { RequestType } from '../../../_interfaces/RequestInterfaces';
import { logout } from '../../../_utils/redux/orgSlice';
import styles from './page.module.css';

export default function EventManagement() {
    const params = useParams(); //expecting event id as a string
    const slug = params.slug as string;
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string>("");
    const [org, sendRequest] = useApiAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [polls, setPolls] = useState<Activity[]>([]);
    const [announcements, setAnnouncements] = useState<Activity[]>([]);
    const [drawings, setDrawings] = useState<Activity[]>([]);
    const [eventData, setEventData] = useState<EventData>(EventDataDefault);

    const dispatch = useDispatch();
    const router = useRouter();

    const dispatchLogout = async () => {
        await dispatch(logout());
    }

    const getEventById = async (id: string) => {
        try {
            const body = {};
            const requestType = RequestType.GET;
            const endpoint = `events/${id}`
            const data = await sendRequest({ requestType, endpoint, body });
            return data;
        } catch (err) {
            return err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById(slug);
            setEventData({
                ...data,
                date: new Date(data.date)
            });
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchActivitiesByType = async () => {
            try {
                const requestType = RequestType.POST;
                const endpoint = "activities/filtered";

                const fetchByType = async (type: string) => {
                    const body = { eventID: slug, type };
                    const response = await sendRequest({ requestType, endpoint, body });
                    const rawData = Array.isArray(response) ? response : [];

                    // Turns date object that gets auto converted to string back into date
                    const parsedData = rawData.map((activity: Activity) => ({
                        ...activity,
                        timeStart: new Date(activity.timeStart),
                        timeEnd: new Date(activity.timeEnd),
                    }));

                    return parsedData;
                };

                const pollsData = await fetchByType("poll");
                const announcementsData = await fetchByType("announcement");
                const drawingsData = await fetchByType("drawing");

                setPolls(pollsData);
                setAnnouncements(announcementsData);
                setDrawings(drawingsData);
                setActivities([...pollsData, ...announcementsData, ...drawingsData]);
            } catch (err) {
                console.error("Error fetching activities by type:", err);
            }
        };

        fetchActivitiesByType();
    }, [slug]);


    const createBlankEvent = async () => {
        try {
            const requestType = RequestType.POST;
            const endpoint = "events/orgs/:id/createEvent";
            const body = {
                name: "Your Event Name",
                date: new Date(),
                duration: 0, // Hardcoded for now
                draft: true,
                draftList: [],
                description: "Your Event Description",
                startTime: '12:00',
                endTime: '12:01',
                location: {
                    type: "Point",
                    coordinates: [0, 0]
                },
                organizerID: org.orgId,
                tags: [],
                registeredUsers: [], // Hardcoded for now
                activity: [], // Hardcoded for now
                image: "placeholder" // Hardcoded for now
            };
            const data = await sendRequest({ requestType, endpoint, body });
            return data._id;
        } catch (err) {
            console.log(err);
            return ""
        }
    }

    return (
        <div className={styles.manageWrap}>
            <div className={styles.manageContainer}>
                <div className={styles.manageHeader}>
                    <div className={styles.manageTitle}>{eventData.name}</div>
                    <div className={styles.buttonContainer}>
                        <button
                            className={styles.lightButton}
                            onClick={async () => {
                                const _id = await createBlankEvent()

                                if (_id != "") {
                                    setIsEditing(!isEditing)
                                    setEditingId(eventData._id);
                                }
                            }}
                        >Edit Event</button>
                        <button
                            className={styles.darkButton}
                            onClick={() => setIsModalOpen(true)}
                        >View QR Code</button>
                    </div>
                </div>
                <div className={styles.manageBody}>
                    <div className={`${styles.polls} ${styles.manageSection}`}>
                        <div className={styles.title}>
                            <p className={styles.titleText}>Polls</p>
                            <p className={styles.titleCount}>{polls.length}</p>
                        </div>
                        <div className={styles.activityContainer}>
                            {polls.map((poll) => (
                                <ActivityCard key={poll._id} activity={poll} />
                            ))}
                        </div>
                    </div>
                    <div className={`${styles.drawings} ${styles.manageSection}`}>
                        <div className={styles.title}>
                            <p className={styles.titleText}>Drawings</p>
                            <p className={styles.titleCount}>{drawings.length}</p>
                        </div>
                        <div className={styles.activityContainer}>
                            {drawings.map((drawing) => (
                                <ActivityCard key={drawing._id} activity={drawing} />
                            ))}
                        </div>
                    </div>
                    <div className={`${styles.announcements} ${styles.manageSection}`}>
                        <div className={styles.title}>
                            <p className={styles.titleText}>Announcements</p>
                            <p className={styles.titleCount}>{announcements.length}</p>
                        </div>
                        <div className={styles.activityContainer}>
                            {announcements.map((announcement) => (
                                <ActivityCard key={announcement._id} activity={announcement} />
                            ))}
                        </div>
                    </div>
                </div>
                {isEditing && <EventEditor eventId={editingId} justCreated={false} />}
                {isModalOpen && <QRModal isOpen={isModalOpen} eventId={editingId} onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
}
