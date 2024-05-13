import React, { useState } from "react";

const ProductDetails = ({ book }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border p-4 m-10 my-32">
      <div className="flex justify-between">
        <div className="p-8">
          <div className="text-lg font-semibold mb-2 h-16">
            {book.book_title}
          </div>
          <div className="text-gray-600 mb-2">Author: {book.author}</div>
          <div className="text-gray-600 mb-2">Genre: {book.genre}</div>
          <div className="text-gray-600 mb-2">Publisher: {book.publisher}</div>
          <div className="text-gray-600 mb-2">
            Publication Date: {book.publication_date}
          </div>
          <div className="text-gray-600 mb-2">Language: {book.language}</div>
          <div className="text-gray-600 mb-2">Pages: {book.pages}</div>
          <div className="text-gray-600 mb-2">Price: ${book.price}</div>
        </div>

        <div className="mb-2 h-36 p-8 mr-16">
          <img src={book.images} alt="" className="h-72" />
        </div>
      </div>

      <span
        className={`border rounded-lg py-1 px-4 mx-8 ${
          book.availability
            ? "bg-green-700 text-white"
            : "bg-red-700 text-white"
        }`}
      >
        {book.availability ? "Available" : "Out of Stock"}
      </span>
      <div className="flex mt-5 p-8">
        <button className=" px-2 py-1 mx-2 bg-teal-700 text-white rounded hover:bg-teal-600 ">
          <i class="bx bx-cart-add"></i>
        </button>
        <button className="px-4 py-1 mr-2 bg-teal-700 text-white rounded hover:bg-teal-600 ">
          <i className="bx bx-heart"></i>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
