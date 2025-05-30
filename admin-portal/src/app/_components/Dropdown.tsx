"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import '../_styles/Dropdown.css';
import { Activity, PollContent, AnnouncementContent } from "../_interfaces/EventInterfaces";

export interface DropDownProps {
  title: string;
  items: Activity[];
  onCreate: () => void;
  onEditItem: (id: string) => void;
  onOpen?: () => void;
}

export default function DropDown({
  title,
  items,
  onCreate,
  onEditItem,
  onOpen,
}: DropDownProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };

  const renderActivityTitle = (act: Activity) => {
    switch (act.type) {
      case "announcement":
        return (act.content as AnnouncementContent).title || "Untitled Announcement";
      case "poll":
        return (act.content as PollContent).title || "Untitled Poll";
      default:
        return "Untitled";
    }
  };

  const renderActivityContent = (act: Activity) => {
    if (act.type === "announcement") {
      return (act.content as AnnouncementContent).text || "No description";
    }
    return null;
  };

  return (
    <div className="dropdownContainer">
      <hr className="divider" />
      <div className="activityHeader">
        <h3 className="activityTitle">{title}</h3>
        <div className="activityButtons">
          <button className="addButton" type="button" onClick={onCreate}>+ ADD</button>
          <button className="expandButton" type="button" onClick={toggle}>
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      <div className={`dropdownBody ${open ? 'open' : ''}`}>
        {items.length > 0 && (
          <ul className="cardList">
            {items.map((act) => (
              <li key={act._id} className="cardListItem">
                <div className="activityCard">
                  {/* Placeholder for image */}
                  <div className="thumbnail" />

                  {/* Main info */}
                  <div className="cardInfo">
                    <h4 className="cardTitle">{renderActivityTitle(act)}</h4>
                    {renderActivityContent(act) && (
                      <p className="cardDescription">{renderActivityContent(act)}</p>
                    )}
                  </div>

                  {/* Footer with Edit button */}
                  <div className="cardFooter">
                    <button
                      type="button"
                      className="editActivityButton"
                      onClick={() => onEditItem(act._id)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
