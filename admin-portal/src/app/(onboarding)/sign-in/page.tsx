"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { login } from '../../_utils/redux/orgSlice';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import uwLogo from '../../../../public/images/uwLogo.svg';
import './signin.css';
import signin from '../../../../public/images/signin.svg';

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
    <div className='container'>
      <div className="header">
        <div className="logo">
          <Image src={uwLogo} height={40} width={40} alt="United Way Logo" />
        </div>
        <h1 className="logo-name">United Way</h1>
      </div>
      <div className='body'>
        <div className='formContainer'>
        {/* For returning organizations: */}
          <h1 className="pageTitle">Sign In</h1>
          <form
            className="formContent"
            onSubmit={handleSubmit}>
            <div className="inputContainer">
              <div className="input">
                <p className="inputLabel">Email</p>
                <input
                  className="inputField"
                  type="email"
                  // placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className="input">
              <p className="inputLabel">Password</p>
                <input
                  className="inputField"
                  type="password"
                  // placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>
            <button
              className="button"
              type="submit">
              Submit
            </button>
          </form>
          <div className="pageSwitch">
            <p>New here?</p>
            <Link className="link"href="/sign-up">Create account</Link>
          </div>
          
        </div>
      </div>
      <div className="graphic-contain">
          <Image className="graphic-image" src={signin} alt="Sign In Blob Graphic"/>
        </div> 
    </div>
    
  );
}