import { useState, useRef, useEffect } from "react";
import "../_styles/DropDown.css"
interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  onSelect?: (option: Option, index: number) => void;
  placeholder?: string;
  selectIndex: number;
}

export default function Dropdown({ options, onSelect, placeholder = "Select...", selectIndex}: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Option| null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(option: Option, index:number) {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option, index);
  }

  return (
    <div className="relative inline-block w-48" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-button"
      >
        {selectIndex != -1? options[selectIndex].label : selected ? selected.label: placeholder}
      </button>

      {isOpen && (
        <ul className="dropdown-ul">
        {options.map((option, index) => (
          <li
            key={option.value}
            onClick={() => handleSelect(option, index)}
            className="dropdown-item"
          >
            {option.label}
          </li>
        ))}
      </ul>
      )}

    </div>
  );
}
