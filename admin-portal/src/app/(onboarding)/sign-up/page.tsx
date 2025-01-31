"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const orgByEmail = await getOrgByEmail();
    if (!validateInputs()) {
      return;
    }
    // Check if org is in database already
    if (orgByEmail.data.length != 0) {
      window.alert('This email is already associated with an account.');
      return;
    }
    try {
      const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/createOrg`,
        {
          email: email,
          password: password
        }
      );
      router.push('/onboarding');
    } catch (err) {
      console.log(err);
    }
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

  const validateInputs = () => {
    if (!validateEmail()) {
      window.alert('Enter a valid email.');
      return false;
    } else if (!validatePassword()) {
      window.alert('Enter a valid password. Your password must contain at least 12 characters including an uppercase letter, a lowercase letter, a symbol, and a number.')
      return false;
    }
    return true;
  }

  const validatePassword = () => {
    // Require 12+ characters including uppercase and lowercase letters, a symbol, and a number
    return password.match(
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/
    );
  }

  const validateEmail = () => {
    // Practical implementation of RFC 2822 from https://www.regular-expressions.info/email.html
    return email.toLowerCase().match(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    );
  }

  return (
    <div>
      For new users:
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
      <Link href="/sign-in">
        Already have an account? Sign in
      </Link>
    </div>
  );
}