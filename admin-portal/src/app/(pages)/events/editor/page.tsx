"use client";
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import EventEditor from '@/app/_components/EventEditor';
import useApiAuth from "@/app/_hooks/useApiAuth";
import { RequestType } from "@/app/_interfaces/RequestInterfaces";


export default function Editor() {
  const [org, sendRequest] = useApiAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("test org");

  useEffect(() => {
    const createBlankEvent = async () => {
      try {
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
        return data._id;
      } catch (err) {
        console.log(err);
        return ""
      }
    }

    const createEvent = async () => {
      try {
        if (editingId == "") {
          const _id = await createBlankEvent()
          if (_id != "") {
            console.log("data set")
            setIsEditing(!isEditing)
            setEditingId(_id);
          }
        }

      } catch (err) {
        console.log(err);
        return ""
      }
    };

    createEvent();
  }, []);

  console.log(editingId)
  return (
    <>
      {isEditing && (
        <EventEditor
          orgName={orgName}
          changeState={setIsEditing}
          eventId={editingId}
          justCreated={true}
        />
      )}
    </>
  );
}