"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { useSelector } from 'react-redux';

export default function Onboarding() {
  const router = useRouter();
  const [community, setCommunity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // const [location, setLocation] = useState<string>('');
  const [name, setName] = useState<string>('');

  interface RootState {
    auth: {
      orgId: string;
      authToken: string;
      refreshToken: string;
    };
  }

  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
  const apiEndpoint = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = { community: community, description: description, location: { type: "Point", coordinates: [0, 0, 0] }, name: name, };
    try {
      await axios.patch(apiEndpoint, formData,
        {
          headers: {
              'Authorization': `Bearer ${org.authToken}`,
              'Content-Type': "application/json"
          }
      }
      );
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    router.push('/landing');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <p>Name:</p>
        <input
          type="text"
          placeholder="Organization Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

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
        {/* <p>Location:</p>
        <input
          type="text"
          placeholder="Organization Location"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
        /> */}
        <button
          type="submit">Submit
        </button>
      </div>
    </form>
  )
}

