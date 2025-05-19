"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import '../_styles/Dropdown.css';
import { PollContent } from "../_interfaces/EventInterfaces";

export interface DropDownProps<Item> {
  title: string;
  items: Item[];
  renderItem: (item: Item, onEdit: (id: string) => void) => React.ReactNode;
  onCreate: () => void;
  onEditItem: (id: string) => void;
  onOpen?: () => void;
}

export default function DropDown<Item>({
  title,
  items,
  renderItem,
  onCreate,
  onEditItem,
  onOpen,
}: DropDownProps<Item>) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
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
                    <h4 className="cardTitle">
                      {(act as any).type === "poll" 
                        ? ((act as any).content as PollContent).title || "Untitled"
                        : (act as any).content[0]?.title 
                          || (act as any).content[0]?.question 
                          || "Untitled"}
                    </h4>
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
