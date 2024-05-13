import React from 'react'

import Footer from './components/Footer/Footer';
import BookCard from './components/Body/BookCard';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <AppRoutes/>
      <ToastContainer />
    </div>
  )
}

export default App;
