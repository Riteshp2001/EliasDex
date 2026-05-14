"use client";

import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Head from "next/head";
import Loader from "@/components/Loader";
import Image from "@/components/Image";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { genres } from "@/utils/genres";
import AnimeCard from "@/components/AnimeCard";

// ─── DEDUPLICATION UTILITY ─────────────────────────────────────────
const dedupeByKey = (arr, key = "id") => {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  const getKey = typeof key === "function" ? key : (item) => item?.[key];
  const seen = new Map();
  for (const item of arr) {
    const id = getKey(item);
    if (id != null && !seen.has(id)) {
      seen.set(id, item);
    } else if (id == null) {
      seen.set(`__fallback_${Math.random()}`, item);
    }
  }
  return Array.from(seen.values());
};

const dedupeJikanResponse = (response) => {
  if (!response?.data || !Array.isArray(response.data)) return response;
  const uniqueData = dedupeByKey(response.data, "mal_id");
  if (uniqueData.length !== response.data.length && process.env.NODE_ENV === "development") {
    console.warn(`[Dedupe] Removed ${response.data.length - uniqueData.length} duplicates`);
  }
  return { ...response, data: uniqueData };
};

// ─── CONSTANTS ─────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Special" },
  { value: "ona", label: "ONA" },
  { value: "music", label: "Music" },
  { value: "cm", label: "CM" },
  { value: "pv", label: "PV" },
  { value: "tv_special", label: "TV Special" },
];
const STATUS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Complete" },
  { value: "upcoming", label: "Upcoming" },
];
const ORDER_OPTIONS = [
  { value: "", label: "Default" },
  { value: "title", label: "Title" },
  { value: "start_date", label: "Start Date" },
  { value: "end_date", label: "End Date" },
  { value: "score", label: "Score" },
  { value: "rank", label: "Rank" },
  { value: "popularity", label: "Popularity" },
  { value: "members", label: "Members" },
  { value: "favorites", label: "Favorites" },
  { value: "episodes", label: "Episodes" },
];
const SORT_OPTIONS = [
  { value: "desc", label: "↓ Descending" },
  { value: "asc", label: "↑ Ascending" },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const normalizeNumber = (v) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const normalizeList = (str) =>
  str
    ? String(str)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite)
    : [];

const buildApiUrl = (p) => {
  const s = new URLSearchParams();
  if (p.q) s.set("q", p.q);
  if (p.type) s.set("type", p.type);
  if (p.status) s.set("status", p.status);
  if (p.order_by) s.set("order_by", p.order_by);
  if (p.sort) s.set("sort", p.sort);
  if (p.sfw !== undefined && p.sfw !== "") s.set("sfw", p.sfw ? "true" : "false");
  if (p.genres?.length) s.set("genres", p.genres.join(","));
  if (p.genres_exclude?.length) s.set("genres_exclude", p.genres_exclude.join(","));
  if (p.unapproved) s.set("unapproved", "true");
  if (p.page) s.set("page", String(p.page));
  s.set("limit", "20");
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.jikan.moe/v4";
  return `${base}/anime?${s.toString()}`;
};

const fetchWithRetry = async (url, retries = 3, delay = 1000, signal = null) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const actualSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
      const res = await fetch(url, { signal: actualSignal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (i < retries - 1 && !err.name?.includes("AbortError")) {
        await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};

// ─── MICRO COMPONENTS ──────────────────────────────────────────────
const iCls =
  "w-full rounded-lg border border-[#1e2d3d] bg-[#0b1421] px-2.5 py-1.5 text-xs text-white outline-none transition focus:border-[#f59e0b]";

const Sel = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} className={iCls}>
    {options.map((o) => (
      <option key={o.value ?? o} value={o.value ?? o}>
        {o.label ?? o}
      </option>
    ))}
  </select>
);

const FLabel = ({ label, children }) => (
  <div>
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#3d5166]">{label}</p>
    {children}
  </div>
);

const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] text-[#f59e0b]">
    {label}
    <button type="button" onClick={onRemove} className="hover:text-white leading-none">
      ✕
    </button>
  </span>
);

// ─── MAIN COMPONENT (memo) ────────────────────────────────────────
const SearchResults = memo(function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qParam = searchParams.get("q") || searchParams.get("keyword") || "";
  const pageParam = searchParams.get("page") || "1";
  const typeParam = searchParams.get("type") || "";
  const statusParam = searchParams.get("status") || "";
  const orderByParam = searchParams.get("order_by") || "";
  const sortParam = searchParams.get("sort") || "desc";
  const sfwParam = searchParams.get("sfw");
  const genresRaw = searchParams.get("genres") || "";
  const genresExRaw = searchParams.get("genres_exclude") || "";
  const unapprovedParam = searchParams.has("unapproved");

  const genresParam = useMemo(() => normalizeList(genresRaw), [genresRaw]);
  const genresExcludeParam = useMemo(() => normalizeList(genresExRaw), [genresExRaw]);

  const [form, setForm] = useState(() => ({
    q: qParam,
    type: typeParam,
    status: statusParam,
    order_by: orderByParam,
    sort: sortParam,
    sfw: sfwParam === null ? true : sfwParam === "true",
    genres: genresParam,
    genres_exclude: genresExcludeParam,
    unapproved: unapprovedParam,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const filterRef = useRef(null);
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const hasActiveSearch = useMemo(
    () => !!(qParam || typeParam || statusParam || orderByParam || genresRaw || genresExRaw || unapprovedParam),
    [qParam, typeParam, statusParam, orderByParam, genresRaw, genresExRaw, unapprovedParam],
  );

  // Fetch data dengan abort
  useEffect(() => {
    if (!hasActiveSearch) return;
    const abortController = new AbortController();
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage("");
      try {
        const url = buildApiUrl({
          q: qParam,
          type: typeParam,
          status: statusParam,
          order_by: orderByParam,
          sort: sortParam,
          sfw: sfwParam === null ? true : sfwParam === "true",
          genres: genresParam,
          genres_exclude: genresExcludeParam,
          unapproved: unapprovedParam,
          page: normalizeNumber(pageParam) || 1,
        });
        const result = await fetchWithRetry(url, 3, 1000, abortController.signal);
        if (!isMounted || abortController.signal.aborted) return;
        const cleanResult = dedupeJikanResponse(result);
        setData(cleanResult);
      } catch (err) {
        if (!isMounted || abortController.signal.aborted) return;
        console.error("Fetch error:", err);
        setIsError(true);
        setErrorMessage(err.name === "AbortError" ? "Request timeout" : "Connection failed. Please try again.");
        setData(null);
      } finally {
        if (isMounted && !abortController.signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [
    hasActiveSearch,
    qParam,
    typeParam,
    statusParam,
    orderByParam,
    sortParam,
    sfwParam,
    genresParam,
    genresExcludeParam,
    unapprovedParam,
    pageParam,
  ]);

  const onChangePage = useCallback(
    (n) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("page", String(n));
      router.push(`/search?${p.toString()}`);
    },
    [searchParams, router],
  );

  const pushWithout = useCallback(
    (key) => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete(key);
      p.set("page", "1");
      router.push(`/search?${p.toString()}`);
    },
    [searchParams, router],
  );

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const p = new URLSearchParams();
      if (form.q) p.set("q", form.q);
      if (form.type) p.set("type", form.type);
      if (form.status) p.set("status", form.status);
      if (form.order_by) p.set("order_by", form.order_by);
      if (form.sort && form.sort !== "desc") p.set("sort", form.sort);
      if (form.sfw !== undefined && form.sfw !== true) p.set("sfw", "false");
      if (form.genres.length) p.set("genres", form.genres.join(","));
      if (form.genres_exclude.length) p.set("genres_exclude", form.genres_exclude.join(","));
      if (form.unapproved) p.set("unapproved", "true");
      p.set("page", "1");
      router.push(`/search?${p.toString()}`);
      setFilterOpen(false);
    },
    [form, router],
  );

  const handleClear = useCallback(() => {
    router.push("/search");
    setFilterOpen(false);
  }, [router]);

  const sf = useCallback(
    (key) => (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    },
    [],
  );

  const activeCount = useMemo(() => {
    let n = 0;
    if (typeParam) n++;
    if (statusParam) n++;
    if (orderByParam) n++;
    if (sortParam && sortParam !== "desc") n++;
    if (sfwParam === "false") n++;
    if (genresRaw) n++;
    if (genresExRaw) n++;
    if (unapprovedParam) n++;
    return n;
  }, [typeParam, statusParam, orderByParam, sortParam, sfwParam, genresRaw, genresExRaw, unapprovedParam]);

  return (
    <div className="list-page bg-[#080d15] text-white min-h-screen pt-14">
      <Head>
        <title>Advanced Anime Search</title>
        <meta property="og:title" content="advanced anime search" />
      </Head>

      <div className="px-4 md:px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Search bar + Filter (responsive row) */}
        <div ref={filterRef} className="relative mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d5166]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                value={form.q}
                onChange={sf("q")}
                placeholder="Search anime by title…"
                className="w-full rounded-xl border border-[#1a2535] bg-[#0d1624] pl-9 pr-8 py-2.5 text-sm text-white outline-none transition focus:border-[#f59e0b] placeholder:text-[#3d5166]"
              />
              {form.q && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, q: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d5166] hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className={`relative flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                  filterOpen || activeCount > 0
                    ? "border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]"
                    : "border-[#1a2535] bg-[#0d1624] text-[#7a95b0] hover:border-[#f59e0b]/40 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                  <span className="flex items-center justify-center rounded-full bg-[#f59e0b] text-black text-[10px] font-bold w-4 h-4 leading-none">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[#f59e0b] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#d97706] transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Popup */}
          {filterOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-[#1a2535] bg-[#0d1624] shadow-2xl shadow-black/60 overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] border-b border-[#1e2d3d] pb-1 mb-3">
                        Type & Status
                      </h3>
                      <div className="space-y-3">
                        <FLabel label="Type">
                          <Sel value={form.type} onChange={sf("type")} options={TYPE_OPTIONS} />
                        </FLabel>
                        <FLabel label="Status">
                          <Sel value={form.status} onChange={sf("status")} options={STATUS_OPTIONS} />
                        </FLabel>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] border-b border-[#1e2d3d] pb-1 mb-3">
                        Sort Order
                      </h3>
                      <div className="space-y-3">
                        <FLabel label="Order by">
                          <Sel value={form.order_by} onChange={sf("order_by")} options={ORDER_OPTIONS} />
                        </FLabel>
                        <FLabel label="Direction">
                          <Sel value={form.sort} onChange={sf("sort")} options={SORT_OPTIONS} />
                        </FLabel>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] border-b border-[#1e2d3d] pb-1 mb-3">
                        Include Genres
                      </h3>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-[#1e2d3d] bg-[#0b1421] p-1">
                        {genres.map((g) => (
                          <label
                            key={g.mal_id}
                            className="flex items-center gap-2 px-2 py-1 text-xs text-white hover:bg-[#1a2535] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={g.mal_id}
                              checked={form.genres.includes(g.mal_id)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setForm((prev) => ({
                                  ...prev,
                                  genres: e.target.checked
                                    ? [...prev.genres, val]
                                    : prev.genres.filter((id) => id !== val),
                                }));
                              }}
                              className="accent-[#f59e0b]"
                            />
                            <span>{g.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] border-b border-[#1e2d3d] pb-1 mb-3">
                        Exclude Genres
                      </h3>
                      <div className="max-h-32 overflow-y-auto rounded-lg border border-[#1e2d3d] bg-[#0b1421] p-1">
                        {genres.map((g) => (
                          <label
                            key={g.mal_id}
                            className="flex items-center gap-2 px-2 py-1 text-xs text-white hover:bg-[#1a2535] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={g.mal_id}
                              checked={form.genres_exclude.includes(g.mal_id)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setForm((prev) => ({
                                  ...prev,
                                  genres_exclude: e.target.checked
                                    ? [...prev.genres_exclude, val]
                                    : prev.genres_exclude.filter((id) => id !== val),
                                }));
                              }}
                              className="accent-[#f59e0b]"
                            />
                            <span>{g.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#7a95b0] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.sfw}
                          onChange={(e) => setForm((p) => ({ ...p, sfw: e.target.checked }))}
                          className="accent-[#f59e0b]"
                        />
                        SFW only
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#7a95b0] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.unapproved}
                          onChange={(e) => setForm((p) => ({ ...p, unapproved: e.target.checked }))}
                          className="accent-[#f59e0b]"
                        />
                        Unapproved
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#111d2b] bg-[#090f1a] px-5 py-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-[#3d5166] hover:text-[#f87171] transition"
                >
                  Reset all filters
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-[#f59e0b] px-5 py-1.5 text-xs font-semibold text-black hover:bg-[#d97706] transition"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {typeParam && <Chip label={`Type: ${typeParam}`} onRemove={() => pushWithout("type")} />}
            {statusParam && <Chip label={`Status: ${statusParam}`} onRemove={() => pushWithout("status")} />}
            {orderByParam && <Chip label={`Order: ${orderByParam}`} onRemove={() => pushWithout("order_by")} />}
            {sortParam && sortParam !== "desc" && (
              <Chip label={`Sort: ${sortParam === "asc" ? "↑ Asc" : "↓ Desc"}`} onRemove={() => pushWithout("sort")} />
            )}
            {sfwParam === "false" && <Chip label="NSFW" onRemove={() => pushWithout("sfw")} />}
            {genresRaw && (
              <Chip label={`${genresParam.length} genre(s) included`} onRemove={() => pushWithout("genres")} />
            )}
            {genresExRaw && (
              <Chip
                label={`${genresExcludeParam.length} genre(s) excluded`}
                onRemove={() => pushWithout("genres_exclude")}
              />
            )}
            {unapprovedParam && <Chip label="Unapproved" onRemove={() => pushWithout("unapproved")} />}
          </div>
        )}

        {/* Result meta */}
        {data?.pagination?.items?.total != null && hasActiveSearch && (
          <p className="mb-3 text-xs text-[#3d5166] tabular-nums">
            {data.pagination.items.total.toLocaleString()} results
            {data.pagination.last_visible_page > 1 &&
              ` · page ${data.pagination.current_page} of ${data.pagination.last_visible_page}`}
          </p>
        )}

        {/* States */}
        {!hasActiveSearch ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-30">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <p className="text-sm text-center px-4">Type a keyword or open Filters to search</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-24">
            <Loader className="h-10 w-10" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-24 gap-3 text-center px-4">
            <p className="text-sm text-[#f87171]">{errorMessage || "Failed to load results."}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-[#f59e0b] px-4 py-2 text-xs font-semibold text-black hover:bg-[#d97706] transition"
            >
              ↻ Refresh page
            </button>
            <button
              onClick={() => router.push(`/search?${searchParams.toString()}`)}
              className="text-xs text-[#3d5166] hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center py-24 gap-1 opacity-50">
            <p className="text-sm">No results found.</p>
          </div>
        ) : (
          <>
            {/* ✅ RUBIHAN UTAMA: 2 kolom di mobile (grid-cols-2) */}
            <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.data.map((item) => (
                <AnimeCard key={item.mal_id} alt={item.title} data={item} />
              ))}
            </div>
            <div className="mt-6">
              <Pagination
                currentPage={data?.pagination?.current_page}
                totalPages={data?.pagination?.last_visible_page}
                onChange={onChangePage}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
});

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchResults />
    </Suspense>
  );
}
