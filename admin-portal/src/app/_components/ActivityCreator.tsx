"use client";

import React, { useState, useEffect } from "react";
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

export default function ActivityCreator({
  eventId,
  type,
  onCancel,
  onCreated,
}: ActivityCreatorProps) {
  const [created, setCreated] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
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
        const end = new Date();

        const response = await axios.post<{
          data: Activity;
        }>(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
          {
            eventID: eventId,
            type,
            content: defaultContent,
            timeStart: start,
            timeEnd: end,
            active: true,
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Edit new {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        {onCancel && (
          <button
            className="text-sm text-gray-500 hover:underline"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}


// "use client";
// import React, { useState } from "react";
// import axios from "axios";
// import "react-datetime-picker/dist/DateTimePicker.css";
// import "react-calendar/dist/Calendar.css";
// import "react-clock/dist/Clock.css";
// import ActivityEditor from "./ActivityEditor";

// interface EventActivityProps {
//   eventId: string;
// }

// export default function ActivityCreator({ eventId }: EventActivityProps) {
//   const [message, setMessage] = useState("");
//   const [refresh, setRefresh] = useState(0);
//   const start = new Date()
//   const end = new Date()

//   const createAct = async (type: string) => {
//     try {
//       const defaultContent =
//         type === "announcement"
//           ? [{ text: "New Announcement" }]
//           : type === "quiz"
//             ? [
//               {
//                 title: "New Question Title",
//                 choices: ["0"],
//                 answers: [0],
//                 singleSelect: true,
//               },
//             ]
//             : type === "poll"
//               ?
//               [
//                 {
//                   question: "New Poll Question",
//                   options: [
//                     { id: 0, text: "Option 1", count: 0 },
//                   ]
//                 },
//               ]
//               : "";

//       await axios.post(
//         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
//         {
//           eventID: eventId,
//           type,
//           content: defaultContent,
//           timeStart: start,
//           timeEnd: end,
//           active: true,
//         }
//       );

//       setMessage(`Created ${type} activity successfully!`);
//       setRefresh((prev) => prev + 1);
//     } catch (err) {
//       console.error(err);
//       setMessage("Error creating activity");
//     }
//   };

//   const handleDropdownChange = async (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     const newType = e.target.value;
//     if (newType) {
//       await createAct(newType);
//       e.target.value = "";
//     }
//   };

//   return (
//     <div>
//       <h2>Create New Activity</h2>
//       <label htmlFor="activityType">Choose an activity (auto-create):</label>
//       <select id="activityType" onChange={handleDropdownChange} defaultValue="">
//         <option value="">-- Select Activity --</option>
//         <option value="announcement">Announcement</option>
//         <option value="poll">Poll</option>
//         <option value="quiz">Quiz</option>
//         <option value="raffle">Raffle</option>
//       </select>

//       {message && <p>{message}</p>}

//       <ActivityEditor id={eventId} refresh={refresh} />
//     </div>
//   );
// }