import React, { useState } from "react";
import MockData from "./MockData"; 

const CartPage = ({cartItems, setCartItems}) => {

const removeFromCart = (bookTitle) => {
    setCartItems(cartItems.filter(item => item.book_title !== bookTitle));
  };
  
  const totalPrice = cartItems.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-center  bg-yellow-400 p-4">Cart Page</h1>
      {cartItems.length === 0 ? (
        <p className="p-5 text-center text-lg">Your cart is empty!!!</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index} className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{item.book_title}</h3>
                    <h3 className="text-gray-600">Price: ${item.price}</h3>
                  </div>
                  <button onClick={() => removeFromCart(item.book_title)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:bg-red-600">Remove</button>

                </div>
              </li>
            ))}
          </ul>
          <p className="text-lg font-semibold mt-4">Total Price: ${totalPrice.toFixed(2)}</p>
          <button className="px-6 py-3 bg-teal-700 text-white rounded hover:bg-teal-600 focus:outline-none focus:bg-blue-600 mt-4 text-center mx-[42%]">Order and Payment</button>
        </>
      )}
    </div>
  );
};

export default CartPage;
