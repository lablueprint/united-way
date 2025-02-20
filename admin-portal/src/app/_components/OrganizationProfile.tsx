import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import EventCard from "./EventCard";
import { EventData } from '../_interfaces/EventInterfaces';
import {RewardsSection} from './RewardsPage'

// TODO: Make the organization profile based on each individual organization instead of all events.
export default function OrganizationProfile() {
    const [eventIds, setEventIds] = useState<string[]>([]);
    const [orgData, setOrgData] = useState<any>(null);
    const [rewards, setRewards] = useState<string[]>([]);

    useEffect(() => {
        // Get all events
        const fetchEvents = async () => {
            try {
                const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/`);
                const { data } = response.data;
                setEventIds(data.map((event: EventData) => event._id));

                const currOrg: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`);
                console.log(currOrg.data.data);
                setOrgData(currOrg.data.data);
                setRewards(currOrg.data.data.rewards || []);

            }
            catch (err) {
                console.log(err);
            }
        }
        fetchEvents();
    }, []);

    const removeFromList = (id: string) => {
        setEventIds(eventIds.filter((eventId) => eventId != id));
    }

    const OrganizationDetails: React.FC<{ org: any }> = ({ org }) => {
        if (!org) return null;
    
        return (
            <div>
                <h2>Organization Details</h2>
                {Object.entries(org).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {JSON.stringify(value)}</p>
                ))}
            </div>
        );
    }

    const addReward = async (newReward: string) => {
        const updatedRewards = [...rewards, newReward];
        try {
            const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
                rewards: updatedRewards
            });
            if (response.data.status === "success") {
                setRewards(updatedRewards);
            }
        } catch (error) {
            console.error("Failed to add reward:", error);
        }
    }
    
    const deleteReward = async (rewardToDelete: string) => {
        const updatedRewards = rewards.filter(reward => reward !== rewardToDelete);
        try {
            const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
                rewards: updatedRewards
            });
            if (response.data.status === "success") {
                setRewards(updatedRewards);
            }
        } catch (error) {
            console.error("Failed to delete reward:", error);
        }
    }

    return (
        <div>
            <h1>Organization Profile</h1>
            {orgData && <OrganizationDetails org={orgData} />}
            <div>
                <h2>Events</h2>
                <div>
                    {eventIds.map((id: string) => {
                        return <EventCard id={id} key={id} removeFromList={removeFromList} />;
                    })}
                </div>
                <RewardsSection 
                    rewards={rewards} 
                    onAdd={addReward} 
                    onDelete={deleteReward} 
                />
            </div>
        </div>
    );
}