import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";

interface EditCardProps {
    id: string;
    handleCloseClick: () => void;
}

export default function EditCard({ id, handleCloseClick }: EditCardProps) {
  // Variables to store the updated event details
  const [updatedName, setUpdatedName] = useState<string>("");
  const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
  const [updatedDescription, setUpdatedDescription] = useState<string>("");
  const [updatedTags, setUpdatedTags] = useState<string[]>([]);
    
    // Get the event details by ID
    const getEventById = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getEventById/${id}`);
            console.log("got event");
            return response.data;
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
    const editEvent = async () => {
        try {
            const response : AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/editEventDetails/${id}`,
                {
                    name: updatedName,
                    date: updatedDate, 
                    description: updatedDescription,
                    tags: updatedTags
                });
            return response;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    const handleSubmit = async () => {
        try {
            await editEvent();
            // Inherit the function from the parent component to close the modal
            handleCloseClick();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        // Change all the element details to be the new information from the input fields after submit is pressed
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" name="name" placeholder="Name" value={updatedName} onChange={(event) => {setUpdatedName(event.target.value)}} />
            </label>
            <label>
                Date:
                <input type="date" name="date" placeholder="Date" value={updatedDate ? updatedDate.toISOString().split('T')[0] : ''} onChange={(event) => {setUpdatedDate(new Date((event.target as HTMLInputElement).value))}} />
            </label>
            <label>
                Description:
                <input type="text" name="description" placeholder="Description" value={updatedDescription} onChange={(event) => {setUpdatedDescription(event.target.value)}} />
            </label>
            <label>
                Tags:
                <input 
                    type="text" 
                    name="tags" 
                    placeholder="Tags" 
                    value={Array.isArray(updatedTags) ? updatedTags.join(', ') : ''} 
                    onChange={(event) => {setUpdatedTags(event.target.value.split(', '))}}
                />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
}
