import { useState } from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import AudioInfo from "./AudioInfo";

const Image = ({ data }) => {
  const [imgSrc, setImgSrc] = useState(data.images.webp.image_url);
  const fallbackImage = "https://placehold.co/400x600?text=Anime+Not+Found";

  const title = data.title_english ?? data.title ?? "Untitled";
  const score = data.score ? `${data.score.toFixed(1)}` : null;
  const episodes = data.episodes ? `${data.episodes} eps` : null;
  const year = data.year ?? data.aired?.prop?.from?.year ?? null;

  return (
    <Link href={`/anime/${data.mal_id}`} className="group block">
      <div className="anime-card">
        {/* Poster */}
        <div className="anime-poster">
          <LazyLoadImage
            className="anime-poster-img"
            wrapperClassName="anime-poster-wrapper"
            effect="blur"
            src={imgSrc}
            alt={`Poster of ${title}`}
            onError={() => setImgSrc(fallbackImage)}
          />
          {score && (
            <div className="anime-score-badge">
              ⭐ {score}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="anime-info">
          <h2 className="anime-title" title={title}>{title}</h2>

          {data.type && (
            <div className="anime-meta-row">
              <span className="anime-type-badge">{data.type}</span>
              <AudioInfo data={data} />
            </div>
          )}

          <div className="anime-meta-secondary">
            {episodes && <span>📀 {episodes}</span>}
            {year && <span>📅 {year}</span>}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap');

          .anime-card {
            border-radius: 10px;
            overflow: hidden;
            background: #16162a;
            border: 1px solid #1f1f35;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.25s ease,
                        border-color 0.2s ease;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .group:hover .anime-card {
            transform: translateY(-5px);
            box-shadow: 0 18px 45px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.4);
            border-color: rgba(139,92,246,0.35);
          }

          .anime-poster {
            position: relative;
            padding-bottom: 140%;
            overflow: hidden;
            background: #0e0e1a;
          }

          .anime-poster-wrapper {
            position: absolute !important;
            inset: 0;
            width: 100% !important;
            height: 100% !important;
          }

          .anime-poster-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            transition: transform 0.4s ease;
          }

          .group:hover .anime-poster-img {
            transform: scale(1.07);
          }

          .anime-score-badge {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(10, 10, 20, 0.85);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fde68a;
            font-family: 'Syne', sans-serif;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 5px;
            letter-spacing: 0.03em;
          }

          .anime-info {
            padding: 10px 12px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            height: 90px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .anime-title {
            font-family: 'Syne', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #e8e8f4;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            transition: color 0.2s ease;
            min-height: calc(13px * 1.35 * 2);
          }

          .group:hover .anime-title {
            color: #a78bfa;
          }

          .anime-meta-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .anime-type-badge {
            font-family: 'Syne', sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #a78bfa;
            background: rgba(139,92,246,0.12);
            border: 1px solid rgba(139,92,246,0.25);
            padding: 2px 7px;
            border-radius: 4px;
          }

          .anime-meta-secondary {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            font-size: 10px;
            color: #6b6b88;
            font-family: 'Syne', sans-serif;
          }
        `}</style>
      </div>
    </Link>
  );
};

export default Image;