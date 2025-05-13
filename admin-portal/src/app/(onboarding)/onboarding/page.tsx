"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import useApiAuth from "../../_hooks/useApiAuth";
import { RequestType } from "../../_interfaces/RequestInterfaces"

export default function Onboarding() {
  const router = useRouter();
  const sendRequest = useApiAuth();
  const [community, setCommunity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [name, setName] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit form data
    const requestType = RequestType.PATCH;
    const body = { community: community, description: description, location: { type: "Point", coordinates: [0, 0, 0] }, name: name, };
    const endpoint = "orgs/:id";
    await sendRequest({ requestType, body, endpoint })

    router.push('/tabs'); // '/landing'
  };

  return (
    <div className='h1'>
      Introduce your community
      <form onSubmit={handleSubmit} className='form'>
        <p>Name:</p>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <p>Community:</p>
        <input
          type="text"
          onChange={(e) => setCommunity(e.target.value)}
          value={community}
        />
        <p>Description:</p>
        <input
          type="text"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <button
          type="submit">Submit
        </button>
      </form>
    </div>
  )
}

