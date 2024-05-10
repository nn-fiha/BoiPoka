import React from "react";
import SearchBox from "./SearchBox";
import Dropdown from "./Dropdown";

function Header() {
  const writersOptions = [
   
    { value: "writer1", label: "Writer 1" },
    { value: "writer2", label: "Writer 2" },
    { value: "writer3", label: "Writer 3" },
    
  ];

  const genresOptions = [
 
    { value: "genre1", label: "Genre 1" },
    { value: "genre2", label: "Genre 2" },
    { value: "genre3", label: "Genre 3" },
  
  ];

  const publishersOptions = [
   
    { value: "publisher1", label: "Publisher 1" },
    { value: "publisher2", label: "Publisher 2" },
    { value: "publisher3", label: "Publisher 3" },
   
  ];
  return (
    <header>
      <div class="bg-yellow-500 flex justify-around items-center gap-4 font-poppins h-24">
        <div>
          <img src="/images/boipoka.png" alt="BoiPoka Logo" className="h-24" />
        </div>
        <div>
          <SearchBox />
        </div>
        <div class="flex justify-between items-center gap-6 text-lg text-white font-medium">
          <a href="#">Home</a>
          <a href="">Blog</a>
          <a href="">Contact</a>
          <a href="">
            Login <i class="bx bx-log-in text-xl align-middle"></i>
          </a>
        </div>
      </div>
      <div class="bg-[#74a892] flex justify-center gap-20 items-center font-poppins h-12 text-white">
      
        <Dropdown label="Genre" options={genresOptions} />
        <p>Best Sellers</p>
        <Dropdown label="Writer" options={writersOptions} />
        <p>Language</p>
        <Dropdown label="Publisher" options={publishersOptions} />
        <p>Price</p>
        <p>Academic Books</p>
      </div>
    </header>
  );
}

export default Header;
