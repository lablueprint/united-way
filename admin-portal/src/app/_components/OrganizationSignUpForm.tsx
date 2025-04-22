"use client";

import { useState, FormEvent } from 'react';
import axios from "axios";

interface OrganizationSignUpFormProps {
  id: string;
}

export default function NewOrganizationForm({ id } : OrganizationSignUpFormProps) {
  const [community, setCommunity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [name, setName] = useState<string>('');

  const apiEndpoint = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${id}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = { community: community, description: description, location: { type: "Point", coordinates: [0, 0, 0] }, name: name, };
    try {
      await axios.patch(apiEndpoint, formData);
      setCommunity('');
      setDescription('');
      setLocation('');
      setName('');
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
        <button
          type="submit">Submit
        </button>
      </div>
    </form>
  )
}


