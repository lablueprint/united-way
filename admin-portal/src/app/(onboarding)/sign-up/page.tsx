"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { login } from '../../_utils/redux/orgSlice';
import styles from "./page.module.css"

export default function SignUp() {
  // phase: 0 = sign-up form; 1 = 2FA verification form.
  const [phase, setPhase] = useState(0);

  // Sign-up form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Two-Factor fields
  const [otpCode, setOtpCode] = useState('');
  const [hashedCode, setHashedCode] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();

  // If organization is already stored, log in and redirect.
  useEffect(() => {
    const storedOrg = localStorage.getItem('org');
    if (storedOrg != null) {
      const parsedOrg = JSON.parse(storedOrg);
      dispatch(login({
        orgId: parsedOrg.orgId,
        authToken: parsedOrg.authToken,
        refreshToken: parsedOrg.refreshToken
      }));
      router.push('/landing');
    }
  }, [dispatch, router]);

  // Validate email using regex
  const validateEmail = () => {
    return email.toLowerCase().match(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    );
  };

  // Validate password: 12+ characters, including uppercase, lowercase, symbol, and number
  const validatePassword = () => {
    return password.match(
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/
    );
  };

  // Overall input validation
  const validateInputs = () => {
    if (!validateEmail()) {
      window.alert('Enter a valid email.');
      return false;
    } else if (!validatePassword()) {
      window.alert('Enter a valid password. Your password must contain at least 12 characters including an uppercase letter, a lowercase letter, a symbol, and a number.');
      return false;
    } else if (confirmPassword !== password) {
      window.alert('Passwords are not the same. Please try again.');
      return false;
    }
    return true;
  };

  // Check if an organization already exists by email
  const getOrgByEmail = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/filtered`,
        { email }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  // Handle sign-up submission (phase 0)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const orgByEmail = await getOrgByEmail();
    // If org exists, alert the user.
    if (orgByEmail && orgByEmail.data && orgByEmail.data.length !== 0) {
      window.alert('This email is already associated with an account.');
      return;
    }
    // Email is new – send OTP for 2FA.
    sendOTP();
  };

  // Send OTP using twofactor/sendOTP endpoint
  const sendOTP = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/twofactor/sendOTP`,
        { email }
      );
      if (response.data) {
        setHashedCode(response.data); // backend returns hashed OTP
        setPhase(1); // proceed to OTP verification phase
      } else {
        window.alert("Error: OTP not received.");
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      window.alert('Error sending OTP.');
    }
  };

  // Verify OTP using twofactor/verifyCode endpoint
  const verifyOTP = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/twofactor/verifyCode`,
        { code: otpCode, hashedCode }
      );
      if (response.data === true) {
        // OTP verified – add organization to database.
        addOrgToDatabase();
      } else {
        window.alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      window.alert("Error verifying OTP.");
    }
  };

  // Add organization to database via orgs/createOrg endpoint
  const addOrgToDatabase = async () => {

    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/createOrg`,
        { email, password }
      );
      dispatch(login({
        orgId: response.data.data._id,
        authToken: response.data.authToken,
        refreshToken: response.data.refreshToken
      }));
      router.push('/onboarding');

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.signUpContainer}>
      {phase === 0 ? (
        // Sign-up Form (phase 0)
        <>
          <div className={styles.formContainer}>
            For new organizations:
            <form
              className={styles.formContent}
              onSubmit={handleSubmit}
            >
              <p
                className={styles.inputLabel}
              >Email:</p>
              <input
                className={styles.inputField}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <p
                className={styles.inputLabel}
              >Password:</p>
              <input
                className={styles.inputField}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <p
                className={styles.inputLabel}
              >Confirm Password:</p>
              <input
                className={styles.inputField}
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
              <button
                className={styles.signUpButton}
                type="submit">
                Submit
              </button>
            </form>
            <Link href="/sign-in">
              Already have an account? Sign in
            </Link>
          </div>
        </>
      ) : (
        // 2FA Verification Form (phase 1)
        <div className={styles.signUpText}>
          <div>2-Step Verification</div>
          <div>
            <p>Please enter the verification code sent to your email.</p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <button onClick={verifyOTP}>Verify</button>
          </div>
        </div>
      )}
    </div>)

}
