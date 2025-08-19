"use client";

import axios, { AxiosResponse } from "axios";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../_utils/redux/orgSlice';

import NavlessBar from "@/app/_components/NavlessBar";
import styles from './page.module.css';

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
    <div className={styles.rootBg}>
      <NavlessBar />
      <div className={styles.formContainer}>
        <div className={`heading2 whiteText`}>
          SIGN IN
        </div>
        <form
          className={styles.formContent}
          onSubmit={handleSubmit}>
          <div className={`${styles.fieldArea}`}>
            <p
              className={`label ${styles.inputLabel}`}
            >E-MAIL</p>
            <input
              className={styles.inputField}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className={`${styles.fieldArea}`}>
            <p
              className={`label ${styles.inputLabel}`}
            >PASSWORD</p>
            <input
              className={styles.inputField}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <button
            className={`body3 ${styles.signInButton}`}
            type="submit">
            SIGN IN
          </button>
        </form>
        <Link href="/sign-up" className={`${styles.signUpLink}`}>
          <div className={`label whiteText`}>
            FIRST TIME HERE?
          </div>
          <div className={`label whiteText boldText`}>
            SIGN UP
          </div>
        </Link>
      </div >
    </div>
  );
}