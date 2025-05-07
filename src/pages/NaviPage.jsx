import React from "react";
import BukhansanBaegundaeRouteMap from "../components/DisplayRoute";
import Arrow from "../components/Arrow";

export default function NaviPage(){
    return(
        <div className="map-container">
            <BukhansanBaegundaeRouteMap />
            <Arrow />
        </div>
    )
}
