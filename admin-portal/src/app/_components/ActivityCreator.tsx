"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ActivityEditor from "./ActivityEditor";
import type { Activity } from "../_interfaces/EventInterfaces";

interface ActivityCreatorProps {
  eventId: string;
  /** activity type: "poll" | "quiz" | "announcement" | "raffle" */
  type: string;
  /** called when canceling creation */
  onCancel?: () => void;
  /** called once a new activity has been created */
  onCreated: (activity: Activity) => void;
}

export default function ActivityCreator({ eventId, type, onCancel, onCreated }: ActivityCreatorProps) {
  const [created, setCreated] = useState<Activity | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const didCreateRef          = useRef(false);

  useEffect(() => {
    if (didCreateRef.current) return;
    didCreateRef.current = true;

    (async () => {
      try {
        // your default content logic
        const defaultContent =
          type === "announcement"
            ? [{ text: "New Announcement" }]
            : type === "poll"
              ? [
                  {
                    question: "New Poll Question",
                    options: [{ id: 0, text: "Option 1", count: 0 }],
                  },
                ]
              : [];

        const start = new Date();
        const end   = new Date();

        // create the activity
        const response = await axios.post<{ data: Activity }>(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
          {
            eventID:  eventId,
            type,
            content:  defaultContent,
            timeStart: start,
            timeEnd:   end,
            active:    true,
          }
        );

        const newAct = response.data.data;
        setCreated(newAct);
        onCreated(newAct);
      } catch (err) {
        console.error(err);
        setError("Failed to create activity. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, type, onCreated]);

  if (loading) {
    return <p>Creating new {type}…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!created) {
    return <p>Unexpected error occurred.</p>;
  }

  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <div>
        <h2>
          Edit new {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Render the editor for the newly created activity */}
      <ActivityEditor id={created._id} refresh={0} />
    </div>
  );
}