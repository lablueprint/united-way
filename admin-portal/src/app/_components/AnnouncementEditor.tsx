"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Announcement {
  text: string;
}

interface AnnouncementEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function AnnouncementEditor({ activityId, timeStart, timeEnd }: AnnouncementEditorProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const activityData = await getActivityById(activityId);
      setAnnouncements(activityData.content.length > 0 ? activityData.content : [{ text: "" }]);
    };
    fetchAnnouncements();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
      return { content: [] };
    }
  };

  const handleTextChange = (index: number, newText: string) => {
    const updated = [...announcements];
    updated[index].text = newText;
    setAnnouncements(updated);
    setIsModified(true);
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, { text: "" }]);
    setIsModified(true);
  };

  const deleteAnnouncement = (index: number) => {
    if (announcements.length === 1) return; // Prevent deleting the last one
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated);
    setIsModified(true);
  };

  const saveAnnouncements = async () => {
    try {
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        { content: announcements, timeStart, timeEnd }
      );
      setIsModified(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h3>Announcements</h3>
      {announcements.map((announcement, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <textarea
            name="text"
            placeholder="Enter announcement text"
            value={announcement.text}
            onChange={(event) => handleTextChange(index, event.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
          <button onClick={() => deleteAnnouncement(index)} disabled={announcements.length === 1}>
            Delete
          </button>
        </div>
      ))}
      <button type="button" onClick={addAnnouncement}>
        Add
      </button>
      <button type="button" onClick={saveAnnouncements} disabled={!isModified}>
        Save
      </button>
    </div>
  );
}





// "use client";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// interface Message {
//   eventID: string;
//   _id: number;
//   content: { text: string }[];
// }
// interface AnnouncementEditorProps {
//   id: string;
//   timeStart: Date;
//   timeEnd: Date;
// }

// export default function AnnouncementEditor({ id, timeStart, timeEnd }: AnnouncementEditorProps) {
//   const [message, setMessage] = useState<Message | null>(null);

//   const fetchAnnounce = async () => {
//     try {
//       const { data } = await axios.post(
//         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
//         {
//           eventID: id,
//           type: "announcement",
//         }
//       );

//       if (data.data.length > 0) {
//         setMessage({
//           ...data.data[0],
//           content: data.data[0].content.length ? data.data[0].content : [{ text: "" }],
//         });
//       } else {
//         setMessage({ eventID: id, _id: 0, content: [{ text: "" }] });
//       }
//     } catch (error) {
//       console.error("Error fetching message:", error);
//     }
//   };

//   useEffect(() => {
//     fetchAnnounce();
//   }, []);

//   const handleAddText = () => {
//     if (!message) return;
//     setMessage((prevMessage) =>
//       prevMessage
//         ? {
//             ...prevMessage,
//             content: [...prevMessage.content, { text: "" }],
//           }
//         : null
//     );
//   };

//   const handleUpdateText = (index: number, value: string) => {
//     if (!message) return;
//     setMessage((prevMessage) =>
//       prevMessage
//         ? {
//             ...prevMessage,
//             content: prevMessage.content.map((t, i) =>
//               i === index ? { ...t, text: value } : t
//             ),
//           }
//         : null
//     );
//   };

//   const handleDeleteText = async (index: number) => {
//     if (!message || !message.content) return; // Ensure message exists before proceeding
  
//     // Create a new content array without the deleted text
//     const updatedContent = message.content.filter((_, i) => i !== index);
  
//     try {
//       if (message._id) {
//         await axios.patch(
//           `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${message._id}`,
//           { content: updatedContent }
//         );
//         console.log("Text successfully deleted from the database!");
//       }
//     } catch (error) {
//       console.error("Error deleting text from the database:", error);
//       return;
//     }

//     setMessage((prevMessage) =>
//       prevMessage ? { ...prevMessage, content: updatedContent } : null
//     );
//   };
  

//   const handleSave = async () => {
//     if (!message) return;

//     try {
//       if (message._id) {
//         await axios.patch(
//           `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${message._id}`,
//           { 
//             content: message.content,
//             timeStart,
//             timeEnd
//           }
//         );
//         console.log("Announcement successfully updated!");
//       } else {
//         const { data } = await axios.post(
//           `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
//           {
//             eventID: message.eventID,
//             type: "announcement",
//             content: message.content,
//             timeStart,
//             timeEnd,
//             active: true,
//           }
//         );
//         console.log("New announcement created:", data);
//         fetchAnnounce();
//       }
//     } catch (error) {
//       console.error("Error saving announcement:", error);
//     }
//   };

//   return (
//     <div>
//       {message && message.content.map((textObj, index) => (
//         <div key={index} style={{ marginBottom: "10px" }}>
//           <textarea
//             value={textObj.text}
//             onChange={(e) => handleUpdateText(index, e.target.value)}
//             placeholder="Add a message"
//             rows={2}
//             style={{ width: "100%", resize: "none" }}
//           />
//           <div style={{ marginTop: "5px" }}>
//             <button type="button" onClick={() => handleDeleteText(index)}>Delete</button>
//           </div>
//         </div>
//       ))}
//       <button type="button" onClick={handleAddText}>
//         Add Text
//       </button>
//       <button type="button" onClick={handleSave} style={{ marginLeft: "10px" }}>
//         Save
//       </button>
//     </div>
//   );
// }