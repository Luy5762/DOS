import React, { useState } from 'react';

const categories = {
  난이도: ['쉬움', '보통', '어려움', '위험'],
  등산거리: ['3km 미만', '3-6km', '6-12km', '12km 이상'],
  소요시간: ['2시간 미만', '2-4시간', '4-6시간', '6시간 이상'],
  탐방로종류: ['흙길', '데크길', '암릉', '너덜길', '포장도로'],
};

const Filter = () => {
  const [selected, setSelected] = useState({
    난이도: [],
    등산거리: [],
    소요시간: [],
    탐방로종류: [],
  });

  const toggleSelection = (category, value) => {
    setSelected((prev) => {
      const isSelected = prev[category].includes(value);
      return {
        ...prev,
        [category]: isSelected
          ? prev[category].filter((v) => v !== value)
          : [...prev[category], value],
      };
    });
  };

  const handleApply = () => {
    console.log('선택된 필터:', selected);
    // 여기서 API 요청 또는 부모 컴포넌트로 전달 가능
  };

  return (
    <div className="filter-container">
      <h1 className="filter-title">Filter</h1>
      {Object.entries(categories).map(([category, options]) => (
        <div key={category} className="filter-section">
          <h2 className="filter-category">{category}</h2>
          <div className="filter-options">
            {options.map((option) => {
              const isActive = selected[category].includes(option);
              return (
                <button
                  key={option}
                  className={`filter-button ${isActive ? 'active' : ''}`}
                  onClick={() => toggleSelection(category, option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button className="apply-button" onClick={handleApply}>
        적용
      </button>
    </div>
  );
};

export default Filter;
