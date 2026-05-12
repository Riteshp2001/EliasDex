"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const ReadComic = () => {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  // Ambil semua data dari query string
  let chapterLinkRaw = searchParams.get("chapterLink") || "";
  const comicTitle = searchParams.get("comicTitle") || "";
  let chapterNumber = searchParams.get("chapterNumber") || "";
  const comicImage = searchParams.get("comicImage") || "";
  const comicSource = searchParams.get("comicSource") || "";
  const comicChapter = searchParams.get("comicChapter") || "";
  const comicLink = searchParams.get("comicLink") || "";
  const comicPopularity = searchParams.get("comicPopularity") || "";
  const processedLink = searchParams.get("processedLink") || "";

  // Pastikan chapterLink diawali dengan '/' (format API)
  const chapterLink = chapterLinkRaw.startsWith("/") ? chapterLinkRaw : `/${chapterLinkRaw}`;

  // State
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navigation, setNavigation] = useState({
    previousChapter: null,
    nextChapter: null,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const comicContainerRef = useRef(null);

  // Simpan history ke localStorage dan database
  const saveHistory = async (comicData) => {
    try {
      // Save to localStorage (fallback)
      const history = JSON.parse(localStorage.getItem("comicHistory")) || {};
      history[slug] = {
        title: comicData.comicTitle,
        image: comicImage,
        lastChapter: comicData.chapterNumber,
        lastChapterLink: comicData.chapterLink,
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

      // Save to database if user is logged in
      try {
        const response = await fetch("/api/user/comic-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comicId: slug,
            currentChapter: parseInt(comicData.chapterNumber) || 1,
            totalChapters: parseInt(comicChapter) || 0,
            title: comicData.comicTitle,
            image: comicImage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Comic progress saved:", data.message);
        }
      } catch (apiError) {
        console.warn("Failed to save comic progress to database:", apiError);
        // Continue without failing - localStorage fallback is still working
      }
    } catch (e) {
      console.error("Error saving history", e);
    }
  };

  // Fetch data chapter dari API
  useEffect(() => {
    const fetchChapterPages = async () => {
      if (!chapterLink) {
        setError(new Error("No chapter link provided"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPages([]);
      setNavigation({ previousChapter: null, nextChapter: null });
      window.scrollTo(0, 0);

      try {
        const apiUrl = `https://www.sankavollerei.com/comic/chapter${chapterLink}`;
        console.log("Fetching chapter:", apiUrl);

        const response = await axios.get(apiUrl);
        const images = response.data.images || [];
        const navData = response.data.navigation || {
          previousChapter: null,
          nextChapter: null,
        };

        setPages(images);
        setNavigation(navData);
        setLoading(false);

        // Simpan history setelah berhasil
        saveHistory({ chapterLink, comicTitle, chapterNumber });
      } catch (err) {
        console.error("API error:", err);
        setError(err);
        setLoading(false);
        // Fallback dummy images
        setPages([
          "https://picsum.photos/800/1200?random=1",
          "https://picsum.photos/800/1200?random=2",
          "https://picsum.photos/800/1200?random=3",
          "https://picsum.photos/800/1200?random=4",
        ]);
      }
    };

    fetchChapterPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterLink]); // hanya bergantung pada chapterLink, agar tidak infinite loop

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const container = isFullscreen ? comicContainerRef.current : document.documentElement;
      if (!container) return;
      const winScroll = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    const target = isFullscreen ? comicContainerRef.current : window;
    if (target) target.addEventListener("scroll", handleScroll);
    return () => {
      if (target) target.removeEventListener("scroll", handleScroll);
    };
  }, [isFullscreen]);

  // Fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      comicContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleBack = () => {
    const queryParams = new URLSearchParams({
      title: comicTitle,
      image: comicImage,
      chapter: comicChapter,
      source: comicSource,
      link: comicLink,
      popularity: comicPopularity,
      processedLink,
    }).toString();
    router.push(`/comic/${slug}?${queryParams}`);
  };

  // Fungsi untuk navigasi ke chapter lain
  const navigateToChapter = (targetLink, targetChapterNumber) => {
    if (!targetLink) return;
    // Pastikan link dimulai dengan '/'
    const formattedLink = targetLink.startsWith("/") ? targetLink : `/${targetLink}`;
    // Ekstrak chapter number dari link jika tidak disediakan
    let finalChapterNumber = targetChapterNumber;
    if (!finalChapterNumber && formattedLink.includes("-")) {
      finalChapterNumber = formattedLink.split("-").pop();
    }

    const queryParams = new URLSearchParams({
      chapterLink: formattedLink,
      comicTitle,
      chapterNumber: finalChapterNumber,
      comicImage,
      comicSource,
      comicChapter,
      comicLink,
      comicPopularity,
      processedLink,
    }).toString();

    router.push(`/comic/read/${slug}?${queryParams}`);
  };

  const handleNextChapter = () => {
    if (navigation.nextChapter) {
      const nextLink = navigation.nextChapter;
      const nextNumber = nextLink.split("-").pop();
      navigateToChapter(nextLink, nextNumber);
    }
  };

  const handlePrevChapter = () => {
    if (navigation.previousChapter) {
      const prevLink = navigation.previousChapter;
      const prevNumber = prevLink.split("-").pop();
      navigateToChapter(prevLink, prevNumber);
    }
  };

  const hasNext = !!navigation.nextChapter;
  const hasPrev = !!navigation.previousChapter;

  // Render loading
  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen flex flex-col justify-center items-center">
        <div className="relative mb-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-semibold">Memuat Chapter...</p>
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen flex justify-center items-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center backdrop-blur-sm max-w-md">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-300 mb-6">{error.message}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
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
      {/* Top Navigation Bar */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-200 dark:border-gray-800 transition-all ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Kembali</span>
            </button>

            <div className="flex items-center gap-2 flex-1 justify-center mx-4">
              <svg
                className="w-5 h-5 text-indigo-600 dark:text-indigo-400 hidden sm:inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h2 className="text-sm md:text-base font-bold text-center truncate text-gray-900 dark:text-white">
                {comicTitle} - <span className="text-indigo-600 dark:text-indigo-400">{chapterNumber}</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleFullscreen}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Halaman komik */}
      <div className={`pt-[68px] pb-24 ${isFullscreen ? "pt-0" : ""}`}>
        <div className="max-w-4xl mx-auto">
          {pages.map((page, index) => (
            <div key={index} className="relative">
              <Image
                src={page}
                alt={`Halaman ${index + 1}`}
                width={800}
                height={1200}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-auto object-contain block"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 border-t border-gray-200 dark:border-gray-800 transition-all ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-4">
            <button
              onClick={handlePrevChapter}
              disabled={!hasPrev}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                hasPrev
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{chapterNumber}</p>
            </div>

            <button
              onClick={handleNextChapter}
              disabled={!hasNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                hasNext
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
