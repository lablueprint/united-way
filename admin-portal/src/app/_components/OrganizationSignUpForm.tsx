"use client";

import { useState } from 'react';
import axios from "axios";


export default function NewOrganizationForm() {
    const [community, setCommunity] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const apiEndpoint = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/org/createOrg`;

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            return;
        }
        const formData = { community:community, description:description, location:{type: "Point", coordinates: [0, 0, 0]}, name:name, password:password, confirmPassword:confirmPassword, };
        try {
            const response = await axios.post(apiEndpoint, formData);
            console.log('Response:', response.data);
            setCommunity('');
            setDescription('');
            setLocation('');
            setName('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
      };

    return (
        <form onSubmit={handleSubmit}>
        <div>
        <p>Community:</p>
        <input 
          type="text"
          placeholder="Community Name"
          onChange={(e) => setCommunity(e.target.value)}
          value={community}
        />
        
        <p>Description:</p>
        <input 
          type="text"
          placeholder="Organization Description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />

        <p>Location:</p>
        <input 
          type="text"
          placeholder="Organization Location"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
        />

        <p>Name:</p>
        <input 
          type="text"
          placeholder="Organization Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        <p>Password:</p>
        <input 
          type="password"
          placeholder="12345"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <p>Confirm Password:</p>
        <input 
          type="password"
          placeholder="12345"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
        />
            <button 
            type="submit">Submit
            </button>
        </div>
        </form>
    )
}


