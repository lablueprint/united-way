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

  // Get global state
  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
  const apiEndpoint = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit form data
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
    try {
      const data = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/passwordReset/verifyEmail`,  "vanshikaturkar@g.ucla.edu");
    const codeData = data.data;
    console.log(codeData);
    // If no valid email was found, we return -1.
    // if (codeData === -1) {
    //   setErrorMsg('No Account with this Email');
    //   return;
    // }
    // updateHashedCode(codeData);
    // setStep('verifyCode');
    // setErrorMsg('');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    router.push('/tabs'); // '/landing'
  };

  return (
    <div className='h1'>
      Sign-Up
    <form onSubmit={handleSubmit} className='form'>
        <p>Name:</p>
        <input
          type="text"
          // placeholder="Organization Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <p>Community:</p>
        <input
          type="text"
          // placeholder="Community Name"
          onChange={(e) => setCommunity(e.target.value)}
          value={community}
        />
        <p>Description:</p>
        <input
          type="text"
          // placeholder="Organization Description"
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
    </form>
    </div>
  )
}

