"use client";
import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import OrganizationProfile from '../../_components/OrganizationProfile';

import { useState } from "react";
export default function Landing() {
  const [responseValue, setResponseValue] = useState();
  const dispatch = useDispatch();
  const router = useRouter();
  interface RootState {
    auth: {
      orgId: string;
      authToken: string;
      refreshToken: string;
    };
  }

  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

  const dispatchLogout = async () => {
    await dispatch(logout());
  }

  // Example of requesting data from the database/backend and making use of the data.
  const exampleGetToRoot = async () => {
    try {
      console.log(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/`);
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/`
      );
      setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    } // Post request
  }

  return (
    <div>
      Welcome to the test landing page.
      <OrganizationProfile></OrganizationProfile>
      <button
        onClick={() => {
          console.log("Result: ", exampleGetToRoot());
        }}
      >
        Example HTTP Request button
      </button><br />
      Org: {org.orgId}<br />
      Auth: {org.authToken}<br />
      Refresh: {org.refreshToken}<br />
      <button onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
        Log out
      </button>
      <div>Result: {responseValue}</div>
    </div>
  );
}
