import React from "react";
import { FaClosedCaptioning, FaMicrophone } from "react-icons/fa";

const AudioInfo = ({ data }) => {
  AudioInfo;
  return (
    <div className="rounded-child flex flex-nowrap font-extrabold">
      {/* <p className="item bg-purple px-1 text-[12px] text-gray-500">
        <span className="text-sm font-bold">{data.type}</span>
      </p> */}
      <p className="item bg-white px-1 text-[12px] text-black">
        <FaMicrophone />
        <span className="text-sm font-bold">{data.episodes}</span>
      </p>
      {/* <p className="item bg-yellow text-sm px-2  text-black">
        <span className="text-sm font-extrabold">{data.score}</span>
      </p> */}
    </div>
  );
};

export default AudioInfo;
