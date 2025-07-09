"use client";
import EventEditor from '@/app/_components/EventEditor';
import useApiAuth from "@/app/_hooks/useApiAuth";
import { RequestType } from "@/app/_interfaces/RequestInterfaces";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Editor() {
  const [org, sendRequest] = useApiAuth();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState<string | null>(searchParams.get("id"));
  const [isNewEvent, _] = useState<boolean>(searchParams.get("id") === null);
  const router = useRouter();

  useEffect(() => {
    const createBlankEvent = async () => {
      const requestType = RequestType.POST;
      const endpoint = "events/orgs/:id/createEvent";
      const body = {
        name: "Your Event Name",
        date: new Date(),
        duration: 0, // Hardcoded for now
        draft: true,
        draftList: [],
        description: "Your Event Description",
        startTime: '12:00',
        endTime: '12:01',
        location: {
          type: "Point",
          coordinates: [0, 0]
        },
        organizerID: org.orgId,
        tags: [],
        registeredUsers: [], // Hardcoded for now
        activity: [], // Hardcoded for now
        image: "placeholder" // Hardcoded for now
      };
      const data = await sendRequest({ requestType, endpoint, body });
      setEventId(data._id);
    }

    if (eventId === null) {
      createBlankEvent();
    }
  }, []);

  // TODO: add the isNewEvent boolean to the EventEditor props.
  // This will help solve the issue with regards to event cancel deletion.
  console.log(isNewEvent)
  return (
    <>
      {
        eventId !== null ? <EventEditor
          eventId={eventId}
          justCreated={isNewEvent}
        />
          : <></>
      }
    </>
  );
}