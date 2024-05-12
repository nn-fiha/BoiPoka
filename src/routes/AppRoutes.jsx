import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import HomePage from '../components/Body/HomePage';
import CartPage from '../components/Body/CartPage';
import ProductDetails from '../components/Body/ProductDetails';
import MockData from '../components/Body/MockData';

const AppRoutes = () => {
   
    const [cartItems, setCartItems] = useState([]);
    const addToCart = (book) => {
        setCartItems([...cartItems, book]);
    };
    

    return (
        <Router>
            <Routes>
        
                <Route path="/" element={<HomePage addToCart={addToCart} />} />
                <Route path="/home/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} />} />
                <Route path="/details/:title" element={<ProductDetailsPage  />} />
            </Routes>
        </Router>
    );
};



const ProductDetailsPage = () => {
   
    const { title } = useParams();
    const book = MockData.find(book => book.book_title === title);

    return <ProductDetails book={book} />;
};


export default AppRoutes;
