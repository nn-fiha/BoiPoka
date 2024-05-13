import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const BookCard = ({ bookItem, addToCart }) => {
  if (!bookItem) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = () => {
    addToCart(bookItem);
    toast.success(`${bookItem.book_title} is added to cart`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border p-4">
      <div className="flex justify-around">
        <div>
          <div className="text-lg font-semibold mb-2">
            {bookItem.book_title}
          </div>
          <div className="text-gray-600 mb-2">Author: {bookItem.author}</div>
          <div className="text-gray-600 mb-2">Genre: {bookItem.genre}</div>
          <div className="text-gray-600 mb-2">Price: ${bookItem.price}</div>
        </div>
        <div className="mb-2 h-36">
          <img src={bookItem.images} alt="" className="h-full" />
        </div>
      </div>

      <span
        className={`border rounded-lg py-1 px-2 ${
          bookItem.availability
            ? "bg-green-700 text-white"
            : "bg-red-700 text-white"
        }`}
      >
        {bookItem.availability ? "Available" : "Out of Stock"}
      </span>
      <div className="flex mt-5">
        <Link
          to={`details/${bookItem.book_title}`}
          className="bg-yellow-500 text-white px-4 py-1 mx-1 rounded-md"
        >
          <button>Details</button>
        </Link>
        <button
          onClick={handleAddToCart}
          className="px-2 py-1 mx-2 bg-teal-700 text-white rounded hover:bg-teal-600 "
        >
          <i className="bx bx-cart-add"></i>
        </button>
        <button className="px-4 py-1 mr-2 bg-teal-700 text-white rounded hover:bg-teal-600">
          <i className="bx bx-heart"></i>
        </button>
      </div>
    </div>
  );
};

export default BookCard;
