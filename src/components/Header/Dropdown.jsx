import React, { useState } from "react";

function Dropdown({ label, options }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="px-2 py-2"
        style={{ minWidth: "100px" }} 
      >
        {selectedOption ? selectedOption.label : label}
      </button>
      {isOpen && (
        <div className="absolute mt-1 bg-white text-black shadow-md rounded-md" style={{ width: "200px" }}>
        
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
