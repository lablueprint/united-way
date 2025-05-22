"use client";
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link';
import BetterEventEditor from "@/app/_components/BetterEventEditor";
import EventActivities from "@/app/_components/EventActivities";

const Event = () => {
  const params = useParams();
  return (
    <>
        <BetterEventEditor eventId={String(params.id)}/>
        <EventActivities eventID={String(params.id)}/>
        <div>
          Event ID: {params.id}
        </div>
        <br/>
        <Link href="/event">Go Back</Link>
    </>
  )
}

export default Event