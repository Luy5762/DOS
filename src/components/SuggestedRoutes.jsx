import React from 'react';

// 예시 등산로 데이터
const trailData = [
  {
    id: 1,
    name: '북한산 대성문 코스',
    imageUrl: 'https://source.unsplash.com/featured/?mountain,trail',
    distance: '5.2km',
    time: '2시간 30분',
    difficulty: '보통',
  },
  {
    id: 2,
    name: '지리산 노고단 코스',
    imageUrl: 'https://source.unsplash.com/featured/?mountain,path',
    distance: '8.3km',
    time: '4시간',
    difficulty: '어려움',
  },
  {
    id: 3,
    name: '설악산 권금성 코스',
    imageUrl: 'https://source.unsplash.com/featured/?mountain,forest',
    distance: '3.6km',
    time: '1시간 50분',
    difficulty: '쉬움',
  },
];

const SuggestedRoutes = () => {
  return (
    <div className="trail-list-container">
      <h1 className="trail-title">추천 등산로</h1>
      <div className="trail-list">
        {trailData.map((trail) => (
          <div key={trail.id} className="trail-card">
            <img src={trail.imageUrl} alt={trail.name} className="trail-image" />
            <div className="trail-info">
              <h2 className="trail-name">{trail.name}</h2>
              <p>길이: {trail.distance}</p>
              <p>소요시간: {trail.time}</p>
              <p>난이도: {trail.difficulty}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedRoutes;
