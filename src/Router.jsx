import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import InfoPage from "./pages/InfoPage";
import HomePage from "./pages/HomePage";
import DisplayRoute from "./pages/NaviPage";
import ExplorePage from "./pages/ExplorePage";

export default function Router() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/'>
          Home
        </NavLink>
        <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/Explore'>
          Explore
        </NavLink>
        <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/info'>
          MyInfo
        </NavLink>
        {<NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/DisplayRoute'>
          Navi
        </NavLink>}
      </nav>

      <Routes>
        <Route exact path='/' element={<HomePage />} />
        <Route path='/Explore' element={<ExplorePage />} />
        <Route path='/info' element={<InfoPage />} />
        <Route path="/info/*" element={<InfoPage />} />
        <Route path='/DisplayRoute' element={<DisplayRoute />} />
      </Routes>
    </BrowserRouter>
  );
}