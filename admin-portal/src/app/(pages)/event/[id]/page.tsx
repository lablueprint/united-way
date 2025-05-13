"use client";
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link';
import BetterEventEditor from "../../../_components/BetterEventEditor";

const Event = () => {
  const params = useParams();
  return (
    <>
        <BetterEventEditor />
        <div>
            Event ID: {params.id}
        </div>
        <br/>
        <Link href="/event">Go Back</Link>
    </>
  )
}

export default Event