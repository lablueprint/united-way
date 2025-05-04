"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DropDown from "./Dropdown";
import ActivityCreator from "./ActivityCreator";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import type { Activity } from "../_interfaces/EventInterfaces";

interface Props {
  eventId: string;
}

const sections = [
  { title: "Questionnaires", type: "poll" },
  { title: "Raffles",       type: "raffle" },
  { title: "Announcements", type: "announcement" },
  { title: "Quizzes",       type: "quiz" },
];

export default function ActivityDropdown({ eventId }: Props) {
  const [activities, setActivities]           = useState<Activity[]>([]);
  const [refresh, setRefresh]                 = useState(0);
  const [creatingType, setCreatingType]       = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const reload = () => setRefresh((r) => r + 1);

  // 1) load all activities once or whenever refresh changes
  useEffect(() => {
    axios
      .post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
        { eventID: eventId }
      )
      .then((res) => setActivities(res.data.data))
      .catch(console.error);
  }, [eventId, refresh]);

  // 2) If we're creating, show the Create page
  if (creatingType) {
    return (
      <ActivityCreator
        eventId={eventId}
        type={creatingType}
        onCancel={() => setCreatingType(null)}
        onCreated={(newActivity) => {
          setCreatingType(null);
          setSelectedActivity(newActivity);
          setRefresh((r) => r + 1);
        }}
      />
    );
  }

  // 3) If we've selected one to edit, show its editor
  if (selectedActivity) {
    const act = selectedActivity;
    return (
      <div className="p-4">
        <button onClick={() => setSelectedActivity(null)}>
          ← Back to list
        </button>

        {act.type === "poll" && (
          <PollEditor
            activityId={act._id}
            timeStart={new Date(act.timeStart)}
            timeEnd={new Date(act.timeEnd)}
          />
        )}
        {act.type === "announcement" && (
          <AnnouncementEditor
            activityId={act._id}
            timeStart={new Date(act.timeStart)}
            timeEnd={new Date(act.timeEnd)}
          />
        )}
        {/* add RaffleEditor as needed */}
      </div>
    );
  }

  // 4) Default: render all 4 dropdowns
  return (
    <div>
      {sections.map(({ title, type }) => {
        const items = activities.filter((a) => a.type === type);

        return (
          <DropDown<Activity>
            key={type}
            title={title}
            items={items}
            renderItem={(act, onEdit) => (
              <div className="flex justify-between">
                <span>
                  { (act as any).content[0]?.question ??
                    (act as any).content[0]?.title ??
                    `Untitled ${title}` }
                </span>
                <button onClick={() => onEdit(act._id)}>Edit</button>
              </div>
            )}
            onOpen={reload}
            onCreate={() => setCreatingType(type)}
            onEditItem={(id) => {
              const act = activities.find((a) => a._id === id);
              if (act) setSelectedActivity(act);
            }}
          />
        );
      })}
    </div>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import DropDown from "./Dropdown";
// // import QuizEditor from "./QuizEditor";
// import PollEditor from "./PollEditor";
// import AnnouncementEditor from "./AnnouncementEditor";
// import ActivityCreator from "./ActivityCreator";
// import type { Activity } from "../_interfaces/EventInterfaces";

// interface Props {
//   eventId: string;
// }

// const sections = [
//   { title: "Questionnaires", type: "poll" },
//   { title: "Raffles",       type: "raffle" },
//   { title: "Announcements", type: "announcement" },,
// ];

// export default function ActivityDropdown({ eventId }: Props) {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [refresh, setRefresh]     = useState(0);
//   const [creatingType, setCreatingType] = useState<string|null>(null);
//   const [selectedId, setSelected] = useState<string | null>(null);

//   // fixed timestamps for all new activities
//   const start = new Date();
//   const end   = new Date();

//   // fetch all activities for this event
//   useEffect(() => {
//     axios
//       .post(
//         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
//         { eventID: eventId }
//       )
//       .then((res) => setActivities(res.data.data))
//       .catch(console.error);
//   }, [eventId, refresh]);


//   // const createAct = async (type: string) => {
//   //   try {
//   //     const defaultContent =
//   //       type === "announcement"
//   //         ? [{ text: "New Announcement" }]
//   //         : type === "poll"
//   //           ? [
//   //               {
//   //                 question: "New Poll Question",
//   //                 options: [{ id: 0, text: "Option 1", count: 0 }],
//   //               },
//   //             ]
//   //           : "";

//   //     await axios.post(
//   //       `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
//   //       {
//   //         eventID: eventId,
//   //         type,
//   //         content: defaultContent,
//   //         timeStart: start,
//   //         timeEnd: end,
//   //         active: true,
//   //       }
//   //     );
//   //     setRefresh((prev) => prev + 1);
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // };

//   // find the currently-selected activity
//   const selectedActivity = activities.find((a) => a._id === selectedId);

//   if (creatingType) {
//     return (
//       <ActivityCreator
//         eventId={eventId}
//         type={creatingType}
//         // if the user hits “Cancel,” go back to the list
//         onCancel={() => setCreatingType(null)}
//         // once created, clear create‐mode and select the new activity
//         onCreated={(newActivity) => {
//           setCreatingType(null);
//           setSelected(newActivity._id);
//         }}
//       />
//     );
//   }

//   return (
//     <div>
//       {sections.map(({ title, type }) => {
//         const items = activities.filter((a) => a.type === type);

//         return (
//           <DropDown<Activity>
//             key={type}
//             title={title}
//             items={items}
//             renderItem={(act, onEdit) => (
//               <div>
//                 <span>
//                   { /* show the question/title or fallback */ }
//                   { (act as any).content[0]?.question ??
//                     (act as any).content[0]?.title ??
//                     `Untitled ${title}` }
//                 </span>
//                 <button
//                   type="button"
//                   onClick={() => onEdit(act._id)}
//                 >
//                   Edit
//                 </button>
//               </div>
//             )}
//             onCreate={() => setCreatingType(type)}
//             onEditItem={id => setSelected(id)}
//           />
//         );
//       })}

//       {selectedActivity && (
//         <div className="mt-8 p-4 border rounded">
//           {selectedActivity.type === "poll" && (
//             <PollEditor
//               activityId={selectedActivity._id}
//               timeStart={new Date(selectedActivity.timeStart)}
//               timeEnd={new Date(selectedActivity.timeEnd)}
//             />
//           )}
//           {selectedActivity.type === "announcement" && (
//             <AnnouncementEditor
//               activityId={selectedActivity._id}
//               timeStart={new Date(selectedActivity.timeStart)}
//               timeEnd={new Date(selectedActivity.timeEnd)}
//             />
//           )}
//           {/* RaffleEditor here */}
//         </div>
//       )}
//     </div>
//   );
// }
