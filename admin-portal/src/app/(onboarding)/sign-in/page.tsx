"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetOrg = await getOrgByEmail();
    if (targetOrg.data.length === 0) {
      window.alert('Email or password is incorrect.');
      return;
    }
    router.push('/landing');
  };

  const getOrgByEmail = async () => {
    try {
      const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/filtered`,
        {
          email: email
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  return (
    <div>
      For returning users:
      <form onSubmit={handleSubmit}>
        <p>Email:</p>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <p>Password:</p>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button
          type="submit">
            Submit
        </button>
      </form>
      <Link href="/sign-up">
        Don&apos;t have an account? Sign up
      </Link>
    </div>
  );
}