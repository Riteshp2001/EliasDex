import Link from "next/link";

const EpisodeCard = ({ animeId, episode, currentEp, layout }) => {
  const isActive = currentEp?.mal_id === episode.mal_id;

  const colors = {
    Bad: "rgb(231, 76, 60)",
    Mid: "rgb(243, 156, 18)",
    Good: "rgb(244, 208, 63)",
    Awesome: "rgb(40, 180, 99)",
    AbsoluteCinema: "rgb(29, 161, 242)",
    Filler: "#7C5C99",
  };

  const getEpisodeColor = (episode) => {
  if (episode.filler) return colors.Filler;

  const score = episode.score ?? 0;

  if (score <= 1.5) return colors.Bad;
  if (score <= 3.5) return colors.Mid;
  if (score < 4) return colors.Good;
  if (score < 4.5) return colors.Awesome;

  return colors.AbsoluteCinema;
};
  return (
    <Link
      href={`/watch/${animeId}?ep=${episode.mal_id}`}
      className="rounded-xl transition-all duration-200 border"
      style={{
        backgroundColor: isActive ? "var(--primary)" : getEpisodeColor(episode),
        color: isActive ? "#000" : "#fff",
        borderColor: isActive ? "var(--primary)" : getEpisodeColor(episode),
      }}
    >
      {layout === "list" ? (
        <div className="p-4 flex items-center gap-4">
          <span className="font-bold min-w-[40px]">{episode.mal_id}</span>

          <p className="truncate flex-1">{episode.title}</p>

          {episode.filler && <span>👻</span>}
        </div>
      ) : (
        <div className="p-3 text-center">
          <p className="font-semibold">{episode.mal_id}</p>
        </div>
      )}
    </Link>
  );
};

export default EpisodeCard;
