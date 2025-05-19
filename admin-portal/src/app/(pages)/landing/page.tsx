"use client"
import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import HomePage from '../../_components/HomePage';

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
      const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/`)
      setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    } // Post request
  }

  return (
    <div>
      <button onClick={() => { console.log("Result: ", exampleGetToRoot()) }}>
        Example HTTP Request button
      </button><br />
      Org: {org.orgId}<br />
      Auth: {org.authToken}<br />
      Refresh: {org.refreshToken}<br />
      <div>
        Result: {responseValue}
      </div>
      <HomePage></HomePage>
    </div>
  );
}
