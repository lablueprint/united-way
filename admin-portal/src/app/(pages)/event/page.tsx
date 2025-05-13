"use client";
import axios, { AxiosResponse } from "axios";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import { EventData } from '../../_interfaces/EventInterfaces';

export default function Landing() {
  const [responseValue, setResponseValue] = useState();
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [draftIds, setDraftIds] = useState<string[]>([]);

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

  useEffect(() => {
    const getOrganizerEvents = async () => {
      try {
        const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
          {
            organizerID: org.orgId,
            draft: false
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`
            }
          }
        );
        const { data } = response.data;
        setEventIds(data.map((event: EventData) => event._id));
      }
      catch (err) {
        console.log(err);
      }
    }

    const getOrganizerDrafts = async () => {
      try {
        const response: AxiosResponse = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/filtered`,
          {
            organizerID: org.orgId,
            draft: true
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${org.authToken}`
            }
          }
        );
        const { data } = response.data;
        setDraftIds(data.map((event: EventData) => event._id));
      }
      catch (err) {
        console.log(err);
      }
    }

    getOrganizerDrafts();
    getOrganizerEvents();
  })

  return (
    <div>
      <div style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif", fontSize: "2em" }}>
        weLcOme tO tHe EvEnTs pLaCEhoLDer PaGE!!111111
      </div>

      <div style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif", fontSize: "1em" }}>
        <b>Events:</b><br/>
        {eventIds.map((id: string) => {
          return (
            <div key={id}>
              <Link href={`/event/${id}`}>{id}</Link>
              <br/>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif", fontSize: "1em" }}>
        <b>Drafts:</b><br/>
        {draftIds.map((id: string) => {
          return (
            <div key={id}>
              <Link href={`/event/${id}`}>{id}</Link>
              <br/>
            </div>
          );
        })}
      </div>

      <br/><br/><br/>

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