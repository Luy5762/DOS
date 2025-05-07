import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InfoEdit = ({ userInfo, setUserInfo }) => {
  const [formData, setFormData] = useState(userInfo);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserInfo(formData);          // 상위 상태 업데이트
    navigate('/info');             // 저장 후 MyInfo로 이동
  };

  return (
    <div className="form-container">
      <h2 className="form-title">회원정보 수정</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>나이</label>
          <select name="age" value={formData.age} onChange={handleChange}>
            <option value="">선택</option>
            {[...Array(83)].map((_, i) => (
              <option key={i + 18} value={i + 18}>{i + 18}세</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>신장 (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>체중 (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>성별</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
        </div>

        <div className="form-group">
          <label>등산경력</label>
          <select name="experience" value={formData.experience} onChange={handleChange}>
            <option value="">선택</option>
            <option value="6개월 미만">6개월 미만</option>
            <option value="6개월~1년">6개월~1년</option>
            <option value="1~3년">1~3년</option>
            <option value="3~5년">3~5년</option>
            <option value="5년 이상">5년 이상</option>
          </select>
        </div>

        <div className="form-group">
          <label>거주지역</label>
          <input type="text" name="region" value={formData.region} onChange={handleChange} />
        </div>

        <button type="submit" className="submit-button">저장</button>
      </form>
    </div>
  );
};

export default InfoEdit;
