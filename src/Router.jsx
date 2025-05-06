import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import InfoPage from "./pages/Info/InfoPage";
import StartPage from "./pages/Start/StartPage";

export default function Router() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/'>
          Start
        </NavLink>
        <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/about'>
          Info
        </NavLink>
      </nav>

      <Routes>
        <Route exact path='/' element={<StartPage />} />
        <Route path='/about' element={<InfoPage />} />
      </Routes>
    </BrowserRouter>
  );
}