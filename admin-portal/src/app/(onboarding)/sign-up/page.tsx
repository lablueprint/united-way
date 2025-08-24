"use client";
import NavlessBar from "@/app/_components/NavlessBar";
import axios, { AxiosResponse } from "axios";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../_utils/redux/orgSlice';
import styles from "./page.module.css";

export default function SignUp() {
  // phase: 0 = sign-up form; 1 = 2FA verification form.
  const [phase, setPhase] = useState(0);

  // Sign-up form fields
  const [orgName, setOrgName] = useState('')
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
        { email, password, name: orgName }
      );
      dispatch(login({
        orgId: response.data.data._id,
        authToken: response.data.authToken,
        refreshToken: response.data.refreshToken
      }));
      router.push('/tabs')
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.signUpContainer}>
      {phase === 0 ? (
        // Sign-up Form (phase 0)
        <>
          <NavlessBar />
          <div className={styles.formContainer}>
            <div className={`heading2 whiteText`}>
              SIGN UP
            </div>

            <form
              className={`${styles.formContent}`}
              onSubmit={handleSubmit}
            >
              <div className={`${styles.fieldArea}`}>
                <p
                  className={`label ${styles.inputLabel}`}
                >ORGANIZATION NAME</p>
                <input
                  className={styles.inputField}
                  onChange={(e) => setOrgName(e.target.value)}
                  value={orgName}
                />
              </div>
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
              <div className={`${styles.fieldArea}`}>
                <p
                  className={`label ${styles.inputLabel}`}
                >CONFIRM PASSWORD</p>
                <input
                  className={styles.inputField}
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                />
              </div>
              <button
                className={`body3 ${styles.signUpButton}`}
                type="submit">
                SIGN UP
              </button>
            </form>
            <Link href="/sign-in" className={`${styles.signInLink}`}>
              <div className={`label whiteText`}>
                ALREADY HAVE AN ACCOUNT?
              </div>
              <div className={`label whiteText boldText`}>
                SIGN IN
              </div>
            </Link>
          </div>
        </>
      ) : (
        // 2FA Verification Form (phase 1)
        <div className={`${styles.verifySection} whiteText`} >
          <div className={`heading3`}>
            2-Step Verification
          </div>
          <div>
            <p
              className={`label ${styles.inputLabel}`}
            >
              VERIFICATION CODE
            </p>
            <input
              className={styles.inputField}
              type="text"
              placeholder="Enter verification code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <button
              onClick={verifyOTP}
              className={`body3 ${styles.signUpButton}`}
            >Verify</button>
          </div>
        </div>
      )
      }
    </div >)

}
