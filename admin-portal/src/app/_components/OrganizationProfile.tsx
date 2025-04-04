import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";
import { EventData } from '../_interfaces/EventInterfaces';
import {RewardsSection, Reward} from './RewardsSection'

import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

// TODO: Make the organization profile based on each individual organization instead of all events.
export default function OrganizationProfile() {
    const [eventIds, setEventIds] = useState<string[]>([]);
    const [orgData, setOrgData] = useState<any>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    useEffect(() => {
        // Get all events
        const getOrganizerEvents = async () => {
            try {
                const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
                    {
                        organizerID: org.orgId
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${org.authToken}`
                        }
                    }
                );
                const { data } = response.data;
                setEventIds(data.map((event: EventData) => event._id));

                const currOrg: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`);
                console.log(currOrg.data.data);
                setOrgData(currOrg.data.data.rewards);
                setRewards(currOrg.data.data.rewards || []);

            }
            catch (err) {
                console.log(err);
            }
        }
        getOrganizerEvents()
    }, );

    const removeFromList = (id: string) => {
        setEventIds(eventIds.filter((eventId) => eventId != id));
    }

    const addReward = async (newReward: Reward) => {
        try {
            const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
                rewards: [...rewards, newReward]
            });
            if (response.data.status === "success") {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to add reward:", error);
        }
    }

    const deleteReward = async (rewardId: string) => {
        const updatedRewards = rewards.filter(reward => reward._id !== rewardId);
        try {
            const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
                rewards: updatedRewards
            });
            if (response.data.status === "success") {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to delete reward:", error);
        }
    }
        return (
            <div>
                <h1>Organization Profile</h1>
                {/* {orgData && <OrganizationDetails org={orgData} />} */}
                <div>
                    <h2>Events</h2>
                    <div>
                        {eventIds.map((id: string) => {
                            return (
                                <EventCard id={id} key={id} removeFromList={removeFromList} />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
