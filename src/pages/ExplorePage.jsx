// 추천페이지
// 희망 난이도, 희망 지역, 기타 등등 입력하고, 추천 받는 페이지

import React from "react";
import Filter from "../components/Filter";
import SuggestedRoutes from "../components/SuggestedRoutes";

export default function ExplorePage(){
    return(
        <div className="explore-container">
            {/* <h1>등산로 추천 페이지</h1> */}
            {/* <t>추천 페이지!</t> */}
            {/* <br></br>
            <t>희망 난이도, 희망 지역, 기타 등등 입력하고,<br></br> 추천 받는 페이지</t>
            <br></br>
            <t>Filter는 Figma에서 예시로 만들어둔거 가져옴,<br></br>추후 수정 필요</t>
            <br></br>
            <t>추천 등산로 리스트 추후 수정 필요</t> */}
            <Filter />
            <SuggestedRoutes />
        </div>
    );
}