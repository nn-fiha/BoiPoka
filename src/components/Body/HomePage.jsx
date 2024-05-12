import React from "react";
import BookCard from "./BookCard";
import MockData from "./MockData";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const HomePage = ({addToCart}) => {

  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-around mx-16">
        {MockData.map((bookItem, index) => ( 
          <BookCard key={index} bookItem={bookItem} addToCart={addToCart} /> 
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
