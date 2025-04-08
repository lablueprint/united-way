import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import CreateActivity from './CreateActivity';
// import DisplayActivity from './DisplayActivity';
// import EventActivity from './EventActivity';

interface EditCardProps {
    id: string;
    handleCloseClick: () => void;
    handleEditEvent: (name: string, date: Date, description: string, tags: string[]) => void;
}

export default function EditCard({ id, handleCloseClick, handleEditEvent }: EditCardProps) {
    // Variables to store the updated event details
    const [updatedName, setUpdatedName] = useState<string>("");
    const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
    const [updatedDescription, setUpdatedDescription] = useState<string>("");
    const [updatedTags, setUpdatedTags] = useState<string[]>([]);
    const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } });

    // Get the event details by ID
    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.authToken}`
                }
            });
            const { data } = response.data;
            return data;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    // Fetch the event details by ID
    useEffect(() => {
        const fetchData = async () => {
            const data = await getEventById();
            setUpdatedName(data.name);
            setUpdatedDate(new Date(data.date));
            setUpdatedDescription(data.description);
            setUpdatedTags(data.tags || []);
        };
        fetchData();
    }, []);

    // Edit the event details
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            handleEditEvent(updatedName, updatedDate, updatedDescription, updatedTags);
            handleCloseClick();
        } catch (err) {
            console.log(err);
            handleCloseClick();
        }
    }

    return (
        // Change all the element details to be the new information from the input fields after submit is pressed
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" name="name" placeholder="Name" value={updatedName} onChange={(event) => { setUpdatedName(event.target.value) }} />
            </label>
            {/* <label>
                Date:
                <input type="date" name="date" placeholder="Date" value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''} onChange={(event) => { setUpdatedDate(new Date((event.target as HTMLInputElement).value)) }} />
            </label> */}
            <label>
                Description:
                <input type="text" name="description" placeholder="Description" value={updatedDescription} onChange={(event) => { setUpdatedDescription(event.target.value) }} />
            </label>
            <label>
                Tags:
                <input
                    type="text"
                    name="tags"
                    placeholder="Tags"
                    value={Array.isArray(updatedTags) ? updatedTags.join(', ') : ''}
                    onChange={(event) => { setUpdatedTags(event.target.value.split(', ')) }}
                />
            </label>
            <input type="submit" value="Submit" />
            {/* <DisplayActivity id={id}/> */}
            <CreateActivity id={id}/>
        </form>
    );
}