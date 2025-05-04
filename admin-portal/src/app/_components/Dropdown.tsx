"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface DropDownProps<Item> {
  title: string;
  items: Item[];
  renderItem: (item: Item, onEdit: (id: string) => void) => React.ReactNode;
  onCreate: () => void;
  onEditItem: (id: string) => void;
}

export default function DropDown<Item>({
  title,
  items,
  renderItem,
  onCreate,
  onEditItem,
}: DropDownProps<Item>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown-container">
      <div className="dropdown-header">
        <h3>{title}</h3>
        <button type="button" onClick={onCreate}>+</button>
        <button type="button" onClick={() => setOpen((o) => !o)}>
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {open && (
        <div className="dropdown-body">
          <ul className="item-list">
            {items.map((it) => (
              <li key={(it as any)._id} className="item-row">
                {renderItem(it, onEditItem)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
