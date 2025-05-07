import React from "react";
import { Link } from "react-router-dom";

const MyInfo = ({ userInfo }) => {
  return (
    <div className="info-container">
      <h2 className="info-title">내 정보</h2>
      <ul className="info-list">
        <li><span className="label">운동수준</span><span className="value">{userInfo.fitnessLevel}</span></li>
        <li><span className="label">나이</span><span className="value">{userInfo.age}</span></li>
        <li><span className="label">성별</span><span className="value">{userInfo.gender}</span></li>
        <li><span className="label">신장</span><span className="value">{userInfo.height} cm</span></li>
        <li><span className="label">체중</span><span className="value">{userInfo.weight} kg</span></li>
        <li><span className="label">등산경력</span><span className="value">{userInfo.experience}</span></li>
        <li><span className="label">거주지역</span><span className="value">{userInfo.region}</span></li>
      </ul>

      <Link to="edit" className="edit-link">내 정보 수정</Link>
    </div>
  );
};

export default MyInfo;
