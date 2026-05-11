import { useState } from "react";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";

const Player = ({ id, currentEp, changeEpisode, hasNextEp, hasPrevEp }) => {
  console.log(currentEp);

  const [category, setCategory] = useState("sub");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden bg-black aspect-video">
        <iframe
          src={`https://megaplay.buzz/stream/mal/${id}/${currentEp.mal_id}/${category}`}
          width="100%"
          height="100%"
          allowFullScreen
        />
      </div>

      <div className="bg-lightbg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {["sub", "dub"].map((type) => (
            <button
              key={type}
              onClick={() => setCategory(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                category === type ? "bg-primary text-black" : "bg-btnbg"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!hasPrevEp}
            onClick={() => changeEpisode("prev")}
            className="p-2 rounded-lg bg-btnbg disabled:opacity-40"
          >
            <TbPlayerTrackPrevFilled size={22} />
          </button>

          <button
            disabled={!hasNextEp}
            onClick={() => changeEpisode("next")}
            className="p-2 rounded-lg bg-primary text-black disabled:opacity-40"
          >
            <TbPlayerTrackNextFilled size={22} />
          </button>
        </div>

        <div className="text-center md:text-right">
          <p className="font-medium">Episode {currentEp.mal_id}</p>

          {currentEp.filler && (
            <p className="text-red-400 text-sm">Filler Episode</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
