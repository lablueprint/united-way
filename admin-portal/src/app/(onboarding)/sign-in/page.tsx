"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { login } from '../../_utils/redux/orgSlice';
import { useDispatch } from 'react-redux';

import styles from './page.module.css'

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if password is correct
    const targetOrg = await getOrgByEmail();
    const signIn = await verifySignIn();
    if (targetOrg.data.length === 0 || signIn === null) {
      window.alert('Email or password is incorrect.');
      return;
    }
    dispatch(login({
      orgId: targetOrg.data[0]._id,
      authToken: signIn.accessToken,
      refreshToken: signIn.refreshToken
    }));
    // If password is correct, proceed to home screen
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

  const verifySignIn = async () => {
    try {
      const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/auth/orgLogin`,
        {
          email: email,
          password: password
        }
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  return (
    <div className={styles.formContainer}>
      For returning organizations:
      <form
        className={styles.formContent}
        onSubmit={handleSubmit}>
        <p
          className={styles.inputLabel}
        >Email:</p>
        <input
          className={styles.inputField}
          type="email"
          // placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <p
          className={styles.inputLabel}
        >Password:</p>
        <input
          className={styles.inputField}
          type="password"
          // placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button
          className={styles.signInButton}
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