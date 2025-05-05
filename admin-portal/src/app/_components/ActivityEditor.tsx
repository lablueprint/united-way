"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import QuizEditor from "./QuizEditor";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import DateTimePicker from "react-datetime-picker";
import type { Activity } from "../_interfaces/EventInterfaces";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface ActivityEditorProps {
  eventId: string;
  createType?: "poll" | "announcement" | "raffle";
  id?: string;
  onCancel?: () => void;
  onDeleted?: (id: string) => void; 
  refresh?: number;
}

export default function ActivityEditor({
  eventId,
  createType,
  id,
  onCancel,
  onDeleted,
  refresh,
}: ActivityEditorProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [start, setStart]       = useState<Value>(new Date());
  const [end, setEnd]           = useState<Value>(new Date());
  const didCreateRef            = useRef(false);

  // On mount (or when createType/id/refresh change) either create or fetch
  useEffect(() => {
    async function fetchActivity() {
      try {
        const resp = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
          { eventID: eventId }
        );
        const found = (resp.data.data as Activity[]).find(a => a._id === id);
        if (!found) throw new Error("Activity not found");
        setActivity(found);
        setStart(new Date(found.timeStart));
        setEnd(new Date(found.timeEnd));
      } catch (e) {
        console.error(e);
      }
    }

    async function createActivity() {
      try {
        const defaultContent =
          createType === "announcement"
            ? [{ text: "New Announcement" }]
            : createType === "poll"
              ? [{
                  question: "New Poll Question",
                  options: [{ id: 0, text: "Option 1", count: 0 }],
                }]
              : [];

        const res = await axios.post<{ data: Activity }>(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
          {
            eventID:  eventId,
            type:     createType,
            content:  defaultContent,
            timeStart: new Date(),
            timeEnd:   new Date(),
            active:    true,
          }
        );
        const newAct = res.data.data;
        setActivity(newAct);
        setStart(new Date(newAct.timeStart));
        setEnd(new Date(newAct.timeEnd));
      } catch (e) {
        console.error(e);
      }
    }

    if (createType && !didCreateRef.current) {
      didCreateRef.current = true;
      createActivity();
    } else if (id) {
      fetchActivity();
    }
  }, [eventId, createType, id, refresh]);

  const handleDelete = async () => {
    if (!activity) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      await axios.delete(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activity._id}`
      );
      // inform parent
      onDeleted?.(activity._id);
      onCancel?.()
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  // Change activity time on the server
  const updateTime = async (newStart: Date, newEnd: Date) => {
    if (!activity) return;
    try {
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activity._id}`,
        { timeStart: newStart, timeEnd: newEnd }
      );
      setActivity({ ...activity, timeStart: newStart, timeEnd: newEnd });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimeChange = (v: Value, isStart: boolean) => {
    const d = Array.isArray(v) ? v[0] : v;
    if (!d || !activity) return;
    if (isStart) {
      setStart(d);
      updateTime(d, end as Date);
    } else {
      setEnd(d);
      updateTime(start as Date, d);
    }
  };

  // Render the correct sub-editor
  const renderEditor = () => {
    if (!activity) return null;
    return (
      <>
        <div className="my-4">
          <h3>Set Activity Duration</h3>
          <DateTimePicker value={start} onChange={v => handleTimeChange(v, true)} />
          <DateTimePicker value={end}   onChange={v => handleTimeChange(v, false)} />
        </div>

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
            />
          </>
        )}
        {activity.type === "announcement" && (
          <>
            <h3>Announcement Editor</h3>
            <AnnouncementEditor
              activityId={activity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "white",
      zIndex: 1000,
      overflow: "auto",
      padding: "1rem",
    }}>
      <div>
        <h2>
          {createType ? "New " : "Edit "}
        </h2>
        {onCancel && (
          <button onClick={onCancel}>
            Cancel
          </button>
        )}
        {activity && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
        )}
      </div>

      {renderEditor()}
    </div>
  );
}