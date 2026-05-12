"use client";

import { useState, useEffect, useReducer } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function ResultCard({ title, slug, image, type, rating }) {
  return (
    <Link
      href={`/comic/${slug}?processedLink=${slug}`}
      className="group relative flex flex-col rounded-xl bg-gray-900 ring-1 ring-white/5 transition-all duration-300 hover:ring-indigo-500/50 hover:-translate-y-1 overflow-hidden"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-sm">
            {type}
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold leading-tight text-gray-100 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        {rating && (
          <div className="flex items-center gap-1 mt-auto">
            <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-yellow-500">{rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

const initialState = {
  results: [],
  pagination: { currentPage: 1, hasNextPage: false, nextPage: null },
  loading: false,
  error: null,
};

function searchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        results: action.payload.komikList || [],
        pagination: action.payload.pagination || {
          currentPage: 1,
          hasNextPage: false,
        },
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [state, dispatch] = useReducer(searchReducer, initialState);
  const { results, pagination, loading, error } = state;

  useEffect(() => {
    if (query.trim().length === 0) {
      dispatch({ type: "RESET" });
      return;
    }

    const fetchResults = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const res = await fetch(
          `https://www.sankavollerei.com/comic/komikindo/search/${encodeURIComponent(query)}/${currentPage}`,
        );
        if (!res.ok) throw new Error("Gagal memuat hasil pencarian");
        const data = await res.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        console.error(err);
        dispatch({ type: "FETCH_ERROR", payload: err.message });
      }
    };

    fetchResults();
  }, [query, currentPage]);

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    router.push(`/comic/search?${newParams.toString()}`);
  };

  const hasPrev = currentPage > 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Pencarian Komik</h1>
          {query && (
            <p className="text-gray-400">
              Menampilkan hasil untuk: <span className="font-semibold text-white">“{query}”</span>
            </p>
          )}
        </div>

        <div className="mb-8">
          <form
            className="relative max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const q = formData.get("q")?.toString().trim();
              if (q) {
                router.push(`/comic/search?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari judul komik..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Tidak Ditemukan</h2>
            <p className="text-gray-400">Coba kata kunci lain atau periksa ejaan.</p>
          </div>
        )}

        {!query && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Cari Komik Favoritmu</h2>
            <p className="text-gray-400">Masukkan judul untuk memulai pencarian.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((comic) => (
                <ResultCard
                  key={comic.slug}
                  title={comic.title}
                  slug={comic.slug}
                  image={comic.image}
                  type={comic.type}
                  rating={comic.rating}
                />
              ))}
            </div>

            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrev}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  hasPrev
                    ? "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "bg-gray-900/50 text-gray-600 cursor-not-allowed"
                }`}
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-400">Halaman {pagination.currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  pagination.hasNextPage
                    ? "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "bg-gray-900/50 text-gray-600 cursor-not-allowed"
                }`}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
