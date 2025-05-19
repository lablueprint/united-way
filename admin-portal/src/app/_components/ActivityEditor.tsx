"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import QuizEditor from "./QuizEditor";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import DateTimePicker from "react-datetime-picker";
import type { Activity } from "../_interfaces/EventInterfaces";
import "../_styles/DateTimePicker.css";
import "../_styles/ActivityEditor.css";

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
  const [start, setStart]       = useState<Value>(new Date());
  const [end, setEnd]           = useState<Value>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const didCreateRef            = useRef(false);

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

  const handleDelete = async () => {
    if (!activity) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      await axios.delete(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activity._id}`
      );
      onDeleted?.(activity._id);
      onCancel?.()
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  const updateTime = async (newStart: Date, newEnd: Date) => {
    if (!activity) return;
    try {
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activity._id}`,
        { timeStart: newStart, timeEnd: newEnd }
      );
      setActivity({ ...activity, timeStart: newStart, timeEnd: newEnd });
      setStart(newStart);
      setEnd(newEnd);
      setShowDatePicker(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimeChange = (v: Value, isStart: boolean) => {
    const d = Array.isArray(v) ? v[0] : v;
    if (!d) return;
    if (isStart) {
      setStart(d);
    } else {
      setEnd(d);
    }
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
    <div className="activity-editor">
      {/* <div className="activity-editor-header">
        <div className="activity-editor-actions">
          {activity && (
            <button
              onClick={handleDelete}
              className="activity-editor-delete"
            >
              Delete
            </button>
          )}
        </div>
      </div> */}

      {renderEditor()}

      {/* Only show datetime modal for non-poll activities */}
      {showDatePicker && activity?.type !== "poll" && (
        <div className="datetime-modal">
          <div className="datetime-modal-content">
            <h3 className="datetime-modal-title">
              Schedule Activity
            </h3>
            <div className="datetime-field">
              <h4 className="datetime-field-label">
                Start Time
              </h4>
              <DateTimePicker 
                value={start} 
                onChange={v => handleTimeChange(v, true)}
                format="y-MM-dd h:mm a"
                clearIcon={null}
                calendarIcon={null}
                autoFocus={false}
                disableCalendar={false}
                className="datetime-picker"
              />
            </div>
            <div className="datetime-field">
              <h4 className="datetime-field-label">
                End Time
              </h4>
              <DateTimePicker 
                value={end} 
                onChange={v => handleTimeChange(v, false)}
                format="y-MM-dd h:mm a"
                clearIcon={null}
                calendarIcon={null}
                autoFocus={false}
                disableCalendar={false}
                className="datetime-picker"
              />
            </div>
            <div className="datetime-modal-actions">
              <button 
                onClick={() => setShowDatePicker(false)}
                className="datetime-modal-button datetime-modal-button-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateTime(start as Date, end as Date)}
                className="datetime-modal-button datetime-modal-button-save"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}