import React from "react";

function SearchBox() {
  return (
    <div className="mr-56">
      <input 
        type="text"
        placeholder="Search book here"
        className=" w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none absolute "
      /> 
      <button><i class='bx bx-search relative left-[350px] top-2 text-xl '></i></button>
     
    </div>
  );
}

export default SearchBox;
