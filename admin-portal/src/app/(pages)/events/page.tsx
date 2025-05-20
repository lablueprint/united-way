"use client";
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import OrganizationProfile from '../../_components/OrganizationProfile';
import UpcomingCalendar from "@/app/_components/UpcomingCalendar";
import EventEditor from '@/app/_components/EventEditor';
import useApiAuth from "@/app/_hooks/useApiAuth";



export default function Events() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [wasCreated, setWasCreated] = useState(false);
  const [org, sendRequest] = useApiAuth();

  return (
    <div>
      <UpcomingCalendar />
    </div>
  );
}