"use client";
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link';

const Event = () => {
  const params = useParams();
  return (
    <div>
        <p>
            Event ID: {params.id}
        </p>
        <br/>
        <Link href="/event">Go Back</Link>
    </div>
  )
}

export default Event