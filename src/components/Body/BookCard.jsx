import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ bookItem, addToCart }) => { // Rename the parameter to bookItem
  if (!bookItem) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = () => {
    console.log("Adding to cart:", bookItem);
    addToCart(bookItem); 
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border p-4">
      <div className="text-lg font-semibold mb-2 h-16">{bookItem.book_title}</div>
      <div className="text-gray-600 mb-2">Author: {bookItem.author}</div>
      <div className="text-gray-600 mb-2">Genre: {bookItem.genre}</div>
      <div className="text-gray-600 mb-2">Price: ${bookItem.price}</div>
      <span className={`border rounded-lg py-1 px-2 ${bookItem.availability ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
        {bookItem.availability ? "Available" : "Out of Stock"}
      </span>
      <div className='flex mt-5'>
        <Link to={`details/${bookItem.book_title}`} className="bg-yellow-500 text-white px-4 py-1 mx-1 rounded-md">
          <button>Details</button>
        </Link>
        <button onClick={handleAddToCart} className="px-2 py-1 mx-2 bg-teal-700 text-white rounded hover:bg-teal-600 focus:outline-none focus:bg-blue-600">
          <i className='bx bx-cart-add'></i>
        </button>
        <button className="px-4 py-1 mr-2 bg-teal-700 text-white rounded hover:bg-teal-600 focus:outline-none focus:bg-blue-600">
          <i className='bx bx-heart'></i>
        </button>
      </div>
    </div>
  );
}

export default BookCard;
