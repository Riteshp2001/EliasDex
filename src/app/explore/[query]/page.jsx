"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Head from "next/head";
import Loader from "@/components/Loader";
import Image from "@/components/Image";
import Heading from "@/components/Heading";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";

const validQueryType = [
  "tv", "movie", "ova", "special", "ona", "music", "cm", "pv", "tv_special",
];
const validQueryFilter = ["airing", "upcoming", "bypopularity", "favorite"];

const queryLabel = {
  tv: "TV Series",
  movie: "Movies",
  ova: "OVA",
  special: "Specials",
  ona: "ONA",
  music: "Music",
  cm: "CM",
  pv: "PV",
  tv_special: "TV Special",
  airing: "Now Airing",
  upcoming: "Upcoming",
  bypopularity: "Popular",
  favorite: "All-Time Favorites",
};

function ExploreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = params.query;
  const page = searchParams.get("page") || "1";

  const isType = validQueryType.includes(query);
  const isFilter = validQueryFilter.includes(query);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // if (!isType && !isFilter) return <PageNotFound />;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const fetchData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.jikan.moe/v4";
        const path = "/top/anime";
        const endpoint = isType
          ? `${path}?type=${query}&page=${page}`
          : `${path}?filter=${query}&page=${page}`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [query, page, isType]);

  const onChangePage = (newPage) => {
    router.push(`/explore/${query}?page=${newPage}`);
  };

  if (isLoading) {
    return <Loader className="h-[100dvh]" />;
  }

  // if (isError || !data) return <PageNotFound />;

  return (
    <div className="list-page pt-14">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        .list-page {
          background-color: #0e0e1a;
          min-height: 100dvh;
        }

        /* ── Heading ── */
        .list-page h1,
        .list-page .heading {
          font-family: 'Syne', sans-serif !important;
          font-size: clamp(1.6rem, 4vw, 2.8rem) !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          color: #eeeef5 !important;
          padding: 1px 18px 18px !important;
          border-bottom: 1px solid #1e1e2e !important;
        }

        /* ── Grid ── */
        .list-page .flex.flex-wrap {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)) !important;
          gap: 16px !important;
          padding: 18px !important;
          justify-items: stretch !important;
          align-items: start !important;
        }

        /* ── Card wrapper ── */
        .list-page .flw-item {
          width: 100% !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          transition:
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.25s ease !important;
          cursor: pointer !important;
        }

        .list-page .flw-item:hover {
          transform: translateY(-6px) !important;
          box-shadow:
            0 20px 48px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(139, 92, 246, 0.45) !important;
        }

        /* ── Stagger fade-in ── */
        .list-page .flw-item {
          opacity: 0;
          animation: cardIn 0.4s ease forwards;
        }
        .list-page .flw-item:nth-child(1)  { animation-delay: 0.03s; }
        .list-page .flw-item:nth-child(2)  { animation-delay: 0.06s; }
        .list-page .flw-item:nth-child(3)  { animation-delay: 0.09s; }
        .list-page .flw-item:nth-child(4)  { animation-delay: 0.12s; }
        .list-page .flw-item:nth-child(5)  { animation-delay: 0.15s; }
        .list-page .flw-item:nth-child(6)  { animation-delay: 0.18s; }
        .list-page .flw-item:nth-child(7)  { animation-delay: 0.21s; }
        .list-page .flw-item:nth-child(8)  { animation-delay: 0.24s; }
        .list-page .flw-item:nth-child(9)  { animation-delay: 0.27s; }
        .list-page .flw-item:nth-child(10) { animation-delay: 0.30s; }
        .list-page .flw-item:nth-child(n+11){ animation-delay: 0.33s; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Head>
        <title>{queryLabel[query] ?? query} Anime</title>
        <meta property="og:title" content="explore - watanuki" />
      </Head>

      <Heading>{queryLabel[query] ?? query} Anime</Heading>

      <div className="flex flex-wrap justify-around items-center">
        {data?.data?.map((item, index) => (
          <div key={item.mal_id + index} className="flw-item">
            <Image data={item} />
          </div>
        ))}
      </div>

      <Pagination
        currentPage={data?.pagination?.current_page}
        totalPages={data?.pagination?.last_visible_page}
        onChange={onChangePage}
      />

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<Loader className="h-[100dvh]" />}>
      <ExploreContent />
    </Suspense>
  );
}