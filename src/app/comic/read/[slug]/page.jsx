"use client";

import { useState, useEffect, useRef, useReducer, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Loader from "@/components/Loader";

// Reducer untuk state fetch
const initialState = {
  pages: [],
  loading: true,
  error: null,
  navigation: { prev: null, next: null },
  chapterTitle: "",
};

function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null, pages: [], navigation: { prev: null, next: null } };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        pages: action.payload.pages,
        navigation: action.payload.navigation,
        chapterTitle: action.payload.chapterTitle,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "RESET":
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

const ReadComic = () => {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  // Query parameters
  const chapterLinkRaw = searchParams.get("chapterLink") || "";
  const comicTitle = searchParams.get("comicTitle") || "";
  const comicImage = searchParams.get("comicImage") || "";
  const comicSource = searchParams.get("comicSource") || "";
  const comicChapter = searchParams.get("comicChapter") || "";
  const comicLink = searchParams.get("comicLink") || "";
  const comicPopularity = searchParams.get("comicPopularity") || "";
  const processedLink = searchParams.get("processedLink") || "";
  const chapterNumberParam = searchParams.get("chapterNumber") || "";

  const chapterSlug = chapterLinkRaw.startsWith("/") ? chapterLinkRaw.substring(1) : chapterLinkRaw;

  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { pages, loading, error, navigation, chapterTitle } = state;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const comicContainerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const prevProgressRef = useRef(0);

  // Helper: parse chapter number
  const parseChapterNumber = useCallback((str) => {
    if (!str) return 0;
    const match = String(str).match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }, []);

  // Save reading history
  const saveHistory = useCallback(
    async (chapterSlug, title, currentChapterNum, totalChapterNum) => {
      try {
        const history = JSON.parse(localStorage.getItem("comicHistory")) || {};
        history[slug] = {
          title: title,
          image: comicImage,
          lastChapter: String(currentChapterNum),
          lastChapterLink: chapterSlug,
          readDate: new Date().toISOString(),
          comicDataForDetail: {
            comic: {
              title: comicTitle,
              image: comicImage,
              chapter: comicChapter,
              source: comicSource,
              link: comicLink,
              popularity: comicPopularity,
            },
            processedLink,
          },
        };
        localStorage.setItem("comicHistory", JSON.stringify(history));

        try {
          await fetch("/api/user/comic-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comicId: slug,
              currentChapter: currentChapterNum,
              totalChapters: totalChapterNum,
              title: title,
              image: comicImage,
            }),
          });
        } catch (e) {
          console.warn("Gagal menyimpan ke server, fallback localStorage");
        }
      } catch (e) {
        console.error("Error saving history", e);
      }
    },
    [slug, comicImage, comicTitle, comicChapter, comicSource, comicLink, comicPopularity, processedLink]
  );

  // Fetch chapter data
  useEffect(() => {
    if (!chapterSlug) {
      dispatch({ type: "RESET" });
      return;
    }

    const fetchChapter = async () => {
      dispatch({ type: "FETCH_START" });
      window.scrollTo(0, 0);

      try {
        const apiUrl = `https://www.sankavollerei.com/comic/komikindo/chapter/${chapterSlug}`;
        const response = await axios.get(apiUrl);
        const { data } = response.data;

        if (!data || !data.images) {
          throw new Error("Data chapter tidak valid");
        }

        const imageUrls = data.images
          .map((img) => img.url)
          .filter((url) => !url.toLowerCase().endsWith(".gif"));

        if (imageUrls.length === 0) {
          throw new Error("Chapter ini hanya berisi GIF, tidak ada halaman untuk ditampilkan.");
        }

        const cleanTitle = data.title ? data.title.replace(/\n\s+/g, " ").trim() : "";
        const finalTitle = cleanTitle || `Chapter ${chapterNumberParam}`;

        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            pages: imageUrls,
            navigation: {
              prev: data.navigation?.prev || null,
              next: data.navigation?.next || null,
            },
            chapterTitle: finalTitle,
          },
        });

        const currentChapterNumber = parseChapterNumber(chapterNumberParam);
        const firstChapterInfo = data.komikInfo?.chapters?.[0];
        const totalChapters = firstChapterInfo
          ? parseChapterNumber(firstChapterInfo.title)
          : parseChapterNumber(comicChapter) || 0;

        saveHistory(chapterSlug, comicTitle, currentChapterNumber, totalChapters);
      } catch (err) {
        console.error("Fetch chapter error:", err);
        dispatch({ type: "FETCH_ERROR", payload: err });
        // Fallback dummy images
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            pages: [
              "https://picsum.photos/800/1200?random=1",
              "https://picsum.photos/800/1200?random=2",
              "https://picsum.photos/800/1200?random=3",
            ],
            navigation: { prev: null, next: null },
            chapterTitle: `Chapter ${chapterNumberParam} (Error)`,
          },
        });
      }
    };

    fetchChapter();
  }, [chapterSlug, chapterNumberParam, comicTitle, comicChapter, parseChapterNumber, saveHistory]);

  // Scroll progress dengan throttling (requestAnimationFrame)
  useEffect(() => {
    const container = isFullscreen ? comicContainerRef.current : document.documentElement;
    if (!container) return;

    const handleScroll = () => {
      if (scrollAnimationRef.current) return;
      scrollAnimationRef.current = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (Math.abs(progress - prevProgressRef.current) > 0.5) {
          setScrollProgress(progress);
          prevProgressRef.current = progress;
        }
        scrollAnimationRef.current = null;
      });
    };

    const target = isFullscreen ? comicContainerRef.current : window;
    target?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      target?.removeEventListener("scroll", handleScroll);
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [isFullscreen]);

  // Fullscreen detection
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      comicContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleBack = useCallback(() => {
    const params = new URLSearchParams({
      title: comicTitle,
      image: comicImage,
      chapter: comicChapter,
      source: comicSource,
      link: comicLink,
      popularity: comicPopularity,
      processedLink,
    }).toString();
    router.push(`/comic/${slug}?${params}`);
  }, [router, slug, comicTitle, comicImage, comicChapter, comicSource, comicLink, comicPopularity, processedLink]);

  const navigateToChapter = useCallback(
    (targetSlug, chapterNum = null) => {
      if (!targetSlug) return;
      let finalChapter = chapterNum;
      if (!finalChapter) {
        const match = targetSlug.match(/chapter[-.]?(\d+)/i);
        finalChapter = match ? match[1] : "";
      }

      const params = new URLSearchParams({
        chapterLink: `/${targetSlug}`,
        comicTitle,
        chapterNumber: finalChapter,
        comicImage,
        comicSource,
        comicChapter,
        comicLink,
        comicPopularity,
        processedLink,
      }).toString();

      router.push(`/comic/read/${slug}?${params}`);
    },
    [router, slug, comicTitle, comicImage, comicSource, comicChapter, comicLink, comicPopularity, processedLink]
  );

  const handlePrevChapter = useCallback(() => {
    if (navigation.prev) {
      const prevNum = navigation.prev.match(/chapter-(\d+)/)?.[1] || "";
      navigateToChapter(navigation.prev, prevNum);
    }
  }, [navigation.prev, navigateToChapter]);

  const handleNextChapter = useCallback(() => {
    if (navigation.next) {
      const nextNum = navigation.next.match(/chapter-(\d+)/)?.[1] || "";
      navigateToChapter(navigation.next, nextNum);
    }
  }, [navigation.next, navigateToChapter]);

  if (loading) {
    return <Loader message="Memuat chapter..." />;
  }

  if (error && pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a]">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center backdrop-blur-sm max-w-md">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-300 mb-6">{error.message}</p>
          <button onClick={handleBack} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={comicContainerRef}
      className={`relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors ${
        isFullscreen ? "overflow-y-auto" : ""
      }`}
    >
      {/* Top navigation bar */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-200 dark:border-gray-800 ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Kembali</span>
            </button>

            <div className="flex items-center gap-2 flex-1 justify-center mx-2 sm:mx-4">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-center truncate text-gray-900 dark:text-white">
                {comicTitle} -{" "}
                <span className="text-indigo-600 dark:text-indigo-400">{chapterTitle || chapterNumberParam}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleFullscreen} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button onClick={() => router.push("/")} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>

      {/* Image list */}
      <div className={`pt-[60px] sm:pt-[68px] pb-24 ${isFullscreen ? "pt-0" : ""}`}>
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          {pages.map((url, index) => (
            <div key={index} className="relative mb-2 last:mb-0">
              <Image
                src={url}
                alt={`Halaman ${index + 1}`}
                width={800}
                height={1200}
                loading={index < 2 ? "eager" : "lazy"}
                className="w-full h-auto object-contain block"
                sizes="(max-width: 800px) 100vw, 800px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 border-t border-gray-200 dark:border-gray-800 ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 sm:py-4 gap-2 sm:gap-4">
            <button
              onClick={handlePrevChapter}
              disabled={!navigation.prev}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 ${
                navigation.prev
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="text-center truncate px-1">
              <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                {chapterTitle || chapterNumberParam}
              </p>
            </div>

            <button
              onClick={handleNextChapter}
              disabled={!navigation.next}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 ${
                navigation.next
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadComic;