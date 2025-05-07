import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import MyInfo from "../components/MyInfo";
import InfoEdit from "../components/InfoEdit";

export default function InfoPage() {
  const [userInfo, setUserInfo] = useState({
    age: 25,
    gender: "남성",
    height: 172,
    weight: 72,
    experience: "5년 이상",
    fitnessLevel: 4.5,
    region: "서울특별시 은평구"
  });

  return (
    <Routes>
      <Route index element={<MyInfo userInfo={userInfo} />} />
      <Route path="edit" element={<InfoEdit userInfo={userInfo} setUserInfo={setUserInfo} />} />
    </Routes>
  );
}
