/**
 * AnimeCard.jsx
 *
 * - Emblem rating pintar: G, PG, PG-13, R, 18+ (merah untuk R+/Rx)
 * - Hover gambar scale(1.05) lebih halus
 * - Animasi internal teks
 */

import { useState } from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import AudioInfo from "./AudioInfo";

// ─── Bintang ───────────────────────────────────────────────────────────────
function StarRow({ score }) {
  if (!score) return null;
  const filled = Math.min(Math.max(Math.round(score / 2), 0), 5);
  return (
    <div className="ac-stars" aria-label={`${filled} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`ac-star ${i < filled ? "ac-star--on" : "ac-star--off"}`}
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.8 2.7,10.5 3.5,7 1,4.8 4.5,4.5" />
        </svg>
      ))}
    </div>
  );
}

// ─── Helper rating badge ──────────────────────────────────────────────────
function getRatingBadge(ratingRaw) {
  if (!ratingRaw) return null;

  const lower = ratingRaw.toLowerCase();
  
  if (lower.includes("rx") || lower.includes("hentai")) {
    return { text: "18+ Explicit", variant: "adult" };
  }
  if (lower.includes("r+")) {
    return { text: "18+ Restricted", variant: "adult" };
  }
  if (lower.includes("r -") || lower === "r") {
    return { text: "17+ Mature", variant: "mature" };
  }
  if (lower.includes("pg-13")) {
    return { text: "13+ Teens", variant: "teen" };
  }
  if (lower.includes("pg") && !lower.includes("pg-13")) {
    return { text: "PG Guidance", variant: "child" };
  }
  if (lower.includes("g -") || lower === "g") {
    return { text: "All Ages", variant: "all" };
  }
  const short = ratingRaw.split(" - ")[0] || ratingRaw;
  return { text: short, variant: "default" };
}

// ─── AnimeCard ─────────────────────────────────────────────────────────────
const AnimeCard = ({ data }) => {
  const fallback = "https://placehold.co/400x600?text=Not+Found";

  const [imgSrc, setImgSrc] = useState(
    data?.images?.webp?.large_image_url ??
      data?.images?.webp?.image_url ??
      data?.images?.webp?.small_image_url ??
      fallback,
  );

  const title = data.title_english ?? data.title ?? "Untitled";
  const score = data.score ?? null;
  const desc = data.synopsis ?? "";
  const shortDesc = desc.length > 60 ? desc.slice(0, 60) + "..." : desc || "—";
  const ratingRaw = data.rating ?? "";
  const ratingBadge = getRatingBadge(ratingRaw);

  return (
    <Link href={`/anime/${data.mal_id}`} className="ac-link">
      <style>{CSS}</style>

      <article className="ac-card">
        {/* Poster dengan rating badge */}
        <div className="ac-img-wrap">
          {ratingBadge && (
            <div className={`ac-rating-badge ac-rating-badge--${ratingBadge.variant}`} title={ratingRaw}>
              {ratingBadge.text}
            </div>
          )}
          <LazyLoadImage
            className="ac-img"
            wrapperClassName="ac-img-lz"
            effect="blur"
            src={imgSrc}
            alt={`Poster of ${title}`}
            onError={() => setImgSrc(fallback)}
          />
        </div>

        <div className="ac-body">
          <div className="ac-title" title={title}>
            {title}
          </div>

          {score && (
            <div className="ac-rating-row">
              <span className="ac-score">{score.toFixed(1)}</span>
              <StarRow score={score} />
              {data.type && <span className="ac-type-badge">{data.type}</span>}
            </div>
          )}

          <div className="ac-audio-wrap">
            <AudioInfo data={data} />
          </div>
          <p className="ac-desc">{shortDesc}</p>
        </div>
      </article>
    </Link>
  );
};

export default AnimeCard;

// ─── Styles ────────────────────────────────────────────────────────────────
const CSS = `
  .ac-link {
    display: block;
    text-decoration: none;
    color: inherit;
    height: 100%;
  }

  .ac-card {
    --ac-bg: #000;
    --ac-border: #282828;
    --ac-radius: 10px;
    --ac-blue: #1a8cff;
    --ac-text: #ececec;
    --ac-muted: #666;
    --ac-gold: #f5c518;

    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--ac-bg);
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transform: translateY(0) scale(1);
    animation: ac-up 0.5s ease both;
    will-change: transform;
    transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1), border-color 0.3s ease;
  }

  @keyframes ac-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ac-link:nth-child(1) .ac-card { animation-delay: 0.05s; }
  .ac-link:nth-child(2) .ac-card { animation-delay: 0.10s; }
  .ac-link:nth-child(3) .ac-card { animation-delay: 0.15s; }
  .ac-link:nth-child(4) .ac-card { animation-delay: 0.20s; }
  .ac-link:nth-child(5) .ac-card { animation-delay: 0.25s; }
  .ac-link:nth-child(6) .ac-card { animation-delay: 0.30s; }

  .ac-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(26,140,255,0.1), rgba(0,212,255,0.1));
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
    pointer-events: none;
  }

  .ac-link:hover .ac-card,
  .ac-link:focus-visible .ac-card {
    transform: translateY(-8px) scale(1.02);
    border-color: var(--ac-blue);
  }
  .ac-link:hover .ac-card::before { opacity: 1; }
  .ac-link:focus-visible { outline: none; }

  /* Poster wrapper */
  .ac-img-wrap {
    width: 100%;
    padding-bottom: 140%;
    position: relative;
    overflow: hidden;
    background: #111;
    flex-shrink: 0;
  }

  .ac-img-lz {
    position: absolute !important;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  .ac-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  }
  .ac-link:hover .ac-img { transform: scale(1.05); }

  /* Rating badge base */
  .ac-rating-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.65rem;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.3px;
    z-index: 3;
    text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.2);
    pointer-events: none;
    white-space: nowrap;
  }
  /* Varian warna */
  .ac-rating-badge--adult {
    background: #c62828;
    border-color: #ff8a80;
    color: white;
  }
  .ac-rating-badge--mature {
    background: #e65100;
    border-color: #ffb74d;
  }
  .ac-rating-badge--teen {
    background: #2c3e66;
    border-color: #5c6bc0;
  }
  .ac-rating-badge--child {
    background: #1b5e20;
    border-color: #81c784;
  }
  .ac-rating-badge--all {
    background: #33691e;
    border-color: #aed581;
  }
  .ac-rating-badge--default {
    background: rgba(0,0,0,0.75);
    border-color: #888;
  }

  /* Body */
  .ac-body {
    padding: 12px 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    position: relative;
    z-index: 2;
  }

  .ac-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.88rem;
    color: var(--ac-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
    transition: color 0.2s ease;
  }

  .ac-rating-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .ac-score {
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--ac-gold);
    line-height: 1;
    transition: transform 0.2s ease;
  }

  .ac-stars {
    display: flex;
    gap: 1.5px;
    align-items: center;
  }
  .ac-star { width: 13px; height: 13px; flex-shrink: 0; }
  .ac-star--on polygon { fill: var(--ac-gold); transition: fill 0.2s ease; }
  .ac-star--off polygon { fill: #333; }

  .ac-type-badge {
    font-family: 'Syne', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-blue);
    background: rgba(26,140,255,0.1);
    border: 1px solid rgba(26,140,255,0.2);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: auto;
  }

  .ac-audio-wrap { display: flex; }

  .ac-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: var(--ac-muted);
    line-height: 1.5;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    transition: color 0.25s ease;
  }

  /* Hover internal */
  .ac-link:hover .ac-title { color: var(--ac-blue); }
  .ac-link:hover .ac-score { transform: scale(1.05); }
  .ac-link:hover .ac-star--on polygon { fill: #ffdd55; }
  .ac-link:hover .ac-desc { color: #aaa; }

  /* Responsive */
  @media (max-width: 900px) {
    .ac-img-wrap { padding-bottom: 145%; }
    .ac-rating-badge { font-size: 0.6rem; padding: 2px 6px; top: 5px; left: 5px; }
  }
  @media (max-width: 600px) {
    .ac-body { padding: 9px 10px 11px; gap: 5px; }
    .ac-title { font-size: 0.82rem; }
    .ac-star { width: 11px; height: 11px; }
  }
  @media (max-width: 520px) {
    .ac-img-wrap { padding-bottom: 148%; }
  }

  /* Low-end disable heavy effects */
  @media (max-width: 380px) {
    .ac-link:hover .ac-card { transform: none; }
    .ac-link:hover .ac-img { transform: none; }
    .ac-link:hover .ac-card::before { opacity: 0; }
    .ac-link:hover .ac-score { transform: none; }
    .ac-link:hover .ac-title { color: inherit; }
    .ac-link:hover .ac-desc { color: var(--ac-muted); }
    .ac-rating-badge { backdrop-filter: none; background: rgba(0,0,0,0.85); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ac-card, .ac-img, .ac-card::before,
    .ac-title, .ac-score, .ac-star--on polygon, .ac-desc {
      transition: none;
      animation: none;
    }
  }
`;
