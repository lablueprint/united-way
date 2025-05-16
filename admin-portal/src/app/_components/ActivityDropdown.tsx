"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DropDown from "./Dropdown";
import ActivityEditor from "./ActivityEditor";
import type { Activity } from "../_interfaces/EventInterfaces";

interface ActivityDropdownProps {
  eventId: string;
  isDraft: boolean;
}

type ActivityType = "announcement" | "poll" | "raffle";

interface Section {
  title: string;
  type: ActivityType;
}

export default function ActivityDropdown({ eventId, isDraft }: ActivityDropdownProps) {
  const [activities,     setActivities]   = useState<Activity[]>([]);
  const [refresh,        setRefresh]      = useState(0);
  const [creatingType,   setCreatingType] = useState<ActivityType | null>(null);
  const [selectedId,     setSelectedId]   = useState<string | null>(null);

  const sections: Section[] = [
    { title: "Announcements", type: "announcement" },
    { title: "Polls", type: "poll" },
    { title: "Raffles", type: "raffle" },
  ];

  const reload = () => setRefresh(r => r + 1);

  // Fetch activities whenever `refresh` increments
  useEffect(() => {
    axios
      .post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
        { eventID: eventId }
      )
      .then(res => setActivities(res.data.data))
      .catch(console.error);
  }, [eventId, refresh]);

  // If creating a new activity or editing an existing one, show the editor full-page
  if (creatingType || selectedId) {
    return (
      <ActivityEditor
        eventId={eventId}
        createType={creatingType ?? undefined}
        id={selectedId ?? undefined}
        refresh={refresh}
        onCancel={() => {
          setCreatingType(null);
          setSelectedId(null);
          reload();
        }}
        isDraft={isDraft}
      />
    );
  }

  // Otherwise, render the four dropdowns
  return (
    <div className="dropdownsContainer">
      {sections.map(({ title, type }: Section) => {
        const items = activities.filter(a => a.type === type);

        return (
          <DropDown<Activity>
            key={type}
            title={title}
            items={items}
            onOpen={reload}
            onCreate={() => setCreatingType(type)}
            onEditItem={id => setSelectedId(id)}
            renderItem={(act, onEdit) => (
              <div>
                <span>
                  {`${title} ${items.indexOf(act) + 1}`}
                </span>
                <button onClick={() => onEdit(act._id)}>Edit</button>
              </div>
            )}
          />
        );
      })}
    </div>
  );
}