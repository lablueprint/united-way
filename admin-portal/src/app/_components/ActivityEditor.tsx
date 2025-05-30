"use client";
import React, { useEffect, useState, useRef } from "react";
import QuizEditor from "./QuizEditor";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import type { Activity } from "../_interfaces/EventInterfaces";
import "../_styles/ActivityEditor.css";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface ActivityEditorProps {
  eventId: string;
  createType?: "poll" | "announcement" | "raffle";
  id?: string;
  onCancel?: () => void;
  onDeleted?: (id: string) => void;
  refresh?: number;
  isDraft: boolean;
}

export default function ActivityEditor({
  eventId,
  createType,
  id,
  onCancel,
  onDeleted,
  refresh,
  isDraft,
}: ActivityEditorProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [start, setStart] = useState<Value>(new Date());
  const [end, setEnd] = useState<Value>(new Date());
  const didCreateRef = useRef(false);

  const [org, sendRequest] = useApiAuth();

  useEffect(() => {
    async function fetchActivity() {
      try {
        const body = { eventID: eventId };
        const requestType = RequestType.POST;
        const endpoint = "activities/filtered";
        const data = await sendRequest({ body, requestType, endpoint });
        const found = (data as Activity[]).find(a => a._id === id);
        if (!found)
          throw new Error("Activity not found");
        setActivity(found);
        setStart(new Date(found.timeStart));
        setEnd(new Date(found.timeEnd));
      } catch (e) {
        console.error(e);
      }
    }

    if (createType && !didCreateRef.current) {
      didCreateRef.current = true;
      createActivity(createType);
    } else if (id) {
      fetchActivity();
    }
  }, [eventId, createType, id, refresh]);

  async function createActivity(createType: "poll" | "announcement" | "raffle") {
    try {
      const defaultContent =
        createType === "announcement"
          ? [{ text: "New Announcement" }]
          : createType === "poll"
            ? {
              title: "Untitled Page",
              questions: [{
                question: "New Poll Question",
                options: [{ id: 0, text: "Choice 1", count: 0 }],
              }]
            }
            : [];

      const body = {
        eventID: eventId,
        type: createType,
        content: defaultContent,
        timeStart: new Date(),
        timeEnd: new Date(),
        active: true,
      }
      const endpoint = "activities/createActivity";
      const requestType = RequestType.POST;
      const newAct = await sendRequest({ endpoint, requestType, body });
      setActivity(newAct);
      setStart(new Date(newAct.timeStart));
      setEnd(new Date(newAct.timeEnd));
    } catch (e) {
      console.error(e);
    }
  }

  const handleDelete = async () => {
    if (!activity) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;
    const body = {};
    const endpoint = `activities/${activity._id}`;
    const requestType = RequestType.DELETE;
    await sendRequest({ body, endpoint, requestType });

    onDeleted?.(activity._id);
    onCancel?.()
  };

  const updateTime = async (newStart: Date, newEnd: Date) => {
    if (!activity) return;

    const endpoint = `activities/${activity._id}`;
    const body = { timeStart: newStart, timeEnd: newEnd };
    const requestType = RequestType.PATCH;
    await sendRequest({ requestType, body, endpoint });
    setActivity({ ...activity, timeStart: newStart, timeEnd: newEnd });
    setStart(newStart);
    setEnd(newEnd);
  };

  const renderEditor = () => {
    if (!activity) return null;
    return (
      <>
        {activity.type === "quiz" && (
          <>
            <h3>Quiz Editor</h3>
            <QuizEditor
              activityId={activity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
            />
          </>
        )}
        {activity.type === "poll" && (
          <>
            <PollEditor
              activityId={activity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
              isDraft={isDraft}
              onDelete={handleDelete}
              updateTime={updateTime}
            />
          </>
        )}
        {activity.type === "announcement" && (
          <>
            <AnnouncementEditor
              activityId={activity._id}
              timeStart={start as Date}
              onCancel={onCancel}
              onTimeUpdate={updateTime}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="activity-editor">
      {renderEditor()}
    </div>
  );
}