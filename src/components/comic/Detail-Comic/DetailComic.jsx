import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlay, faBookOpen, faClock, faFire, faStar } from "@fortawesome/free-solid-svg-icons";
import SkeletonLoader from "../SkeletonLoader";
import Image from "next/image";

const DetailComic = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const { comic, processedLink } = location.state || {};

  const [comicDetail, setComicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Jika tidak ada processedLink, tidak ada yang perlu di-fetch.
    // Render akan menampilkan pesan error langsung (tanpa setState)
    if (!processedLink) return;

    let cancelled = false;

    const fetchData = async () => {
      // Fetch detail komik
      try {
        const cleanProcessedLink = processedLink.startsWith("/") ? processedLink.substring(1) : processedLink;

        const response = await axios.get(`https://www.sankavollerei.com/comic/comic/${cleanProcessedLink}`);
        if (cancelled) return;

        if (!response.data) {
          throw new Error("Tidak ada data komik yang ditemukan");
        }
        setComicDetail(response.data);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching comic detail:", err);
        setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengambil detail komik");
        // Berikan data fallback agar UI tidak crash total
        setComicDetail({
          synopsis: "Synopsis tidak tersedia.",
          chapters: [],
          creator: "Unknown",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Fetch rekomendasi (tidak memblokir loading utama)
      try {
        const recRes = await axios.get("https://www.sankavollerei.com/comic/recommendations");
        if (cancelled) return;

        const processedRecommendations = recRes.data.recommendations.map((item) => {
          const recSlug = item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const link = item.link.replace("/manga/", "").replace("/detail-komik/", "");
          return {
            ...item,
            image: item.image.includes("lazy.jpg")
              ? "https://via.placeholder.com/300x450?text=Recomendasi"
              : item.image,
            slug: recSlug,
            processedLink: link,
            source: item.reason || "-",
            popularity: item.recommendation_score ? item.recommendation_score.toFixed(2) : "-",
          };
        });

        const filtered = processedRecommendations.filter(
          (item) =>
            !item.title.toLowerCase().includes("apk") &&
            item.chapter &&
            !item.chapter.toLowerCase().includes("download"),
        );

        if (!cancelled) {
          setRecommendations(filtered.filter((r) => r.slug !== slug).slice(0, 8));
        }
      } catch (err) {
        if (!cancelled) console.error("Error fetching recommendations:", err);
      }

      // Muat history dari localStorage
      try {
        const historyData = JSON.parse(localStorage.getItem("comicHistory"));
        if (!cancelled && historyData && historyData[slug]) {
          setHistory(historyData[slug]);
        }
      } catch (e) {
        if (!cancelled) console.error("Error loading history", e);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [processedLink, slug]);

  // Jika processedLink tidak ada, tampilkan error langsung dari render
  if (!processedLink) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
        <div className="flex justify-center items-center min-h-screen p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">Link komik tidak valid</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan loading (hanya saat loading dan tidak ada error)
  if (loading && !error) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Skeleton */}
          <div className="animate-pulse mb-6">
            <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <SkeletonLoader count={3} type="card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan error dari fetch (jika ada)
  if (error) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
        <div className="flex justify-center items-center min-h-screen p-4">
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
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback jika comic tidak tersedia (dari location.state)
  if (!comic) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
        <div className="flex justify-center items-center min-h-screen p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">Komik tidak ditemukan</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleReadComic = (chapterData = null) => {
    let chapterToRead;
    if (chapterData) {
      chapterToRead = chapterData;
    } else if (comicDetail?.chapters && comicDetail.chapters.length > 0) {
      chapterToRead = comicDetail.chapters[0];
    } else {
      alert("No chapters available");
      return;
    }

    navigate(`/read-comic/${slug}/chapter-${chapterToRead.chapter}`, {
      state: {
        chapterLink: chapterToRead.link,
        comicTitle: comic.title,
        chapterNumber: chapterToRead.chapter,
        comicDetailState: { comic, processedLink },
      },
    });
  };

  const handleContinueReading = () => {
    if (history) {
      handleReadComic({
        link: history.lastChapterLink,
        chapter: history.lastChapter,
      });
    }
  };

  const handleRecommendationDetail = (item) => {
    navigate(`/detail-comic/${item.slug}`, {
      state: {
        comic: {
          title: item.title,
          image: item.image,
          chapter: item.chapter,
          source: item.source,
          link: item.link,
          popularity: item.popularity,
        },
        processedLink: item.processedLink,
      },
    });
    // Tidak perlu window.location.reload() – SPA sudah menavigasi secara mulus
  };

  const isLatestChapter = history?.lastChapter === comic.chapter;

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-100 transition-colors py-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="lg:w-2/3 space-y-6">
            {/* Hero Banner ... (sama seperti sebelumnya) */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0">
                <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
                  <Image
                    src={comic.image}
                    alt={comic.title}
                    fill
                    priority // Pengganti fetchpriority="high" dan loading="eager"
                    sizes="100vw"
                    className="object-cover"
                  />
                  {/* Overlay opsional agar teks di atas banner lebih terbaca */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 md:p-12 min-h-[500px] flex flex-col justify-end">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white drop-shadow-2xl">
                  {comic.title}
                </h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    <FontAwesomeIcon icon={faBookOpen} className="text-white" />
                    <span className="text-sm font-semibold text-white">{comic.chapter}</span>
                  </div>
                  {comic.source && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                      <FontAwesomeIcon icon={faStar} className="text-white" />
                      <span className="text-sm font-semibold text-white">{comic.source}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleReadComic()}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all shadow-2xl hover:shadow-green-500/50 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-lg" />
                    Baca Dari Awal
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faHome} />
                    Home
                  </button>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold">Synopsis</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {comicDetail?.synopsis || "Synopsis tidak tersedia."}
              </p>
            </div>

            {/* Continue Reading */}
            {history && !isLatestChapter && (
              <div className="relative overflow-hidden bg-gradient-to-r from-yellow-600/20 to-orange-600/20 dark:from-yellow-600/10 dark:to-orange-600/10 backdrop-blur-sm rounded-2xl border border-yellow-500/30 shadow-lg p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faClock} className="text-yellow-600 dark:text-yellow-400 text-xl" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lanjutkan Membaca</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Chapter Terakhir Dibaca:{" "}
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      Chapter {history.lastChapter}
                    </span>
                  </p>
                  <button
                    onClick={handleContinueReading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-lg hover:shadow-yellow-500/50"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Lanjutkan Chapter {history.lastChapter}
                  </button>
                </div>
              </div>
            )}

            {/* Chapter List */}
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold">Daftar Chapter</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {comicDetail?.chapters?.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleReadComic(chapter)}
                    className={`group relative p-3 rounded-xl text-center text-sm font-semibold transition-all duration-300 ${
                      String(chapter.chapter) === String(history?.lastChapter)
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/30 scale-105"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/30"
                    }`}
                  >
                    {String(chapter.chapter) === String(history?.lastChapter) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                    {chapter.chapter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          {recommendations.length > 0 && (
            <div className="lg:w-1/3">
              <div className="sticky top-20">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FontAwesomeIcon icon={faFire} className="text-orange-600 dark:text-orange-400 text-xl" />
                    <h2 className="text-2xl font-bold">Rekomendasi</h2>
                  </div>
                  <div className="space-y-4">
                    {recommendations.map((item) => (
                      <div
                        key={item.slug}
                        className="group relative bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                        onClick={() => handleRecommendationDetail(item)}
                      >
                        <div className="flex gap-3">
                          <div className="relative w-24 h-32 flex-shrink-0">
                            <div className="relative aspect-[3/4] w-24 sm:w-28 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={item.image || "https://via.placeholder.com/300x450?text=Rekomendasi"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 100px, 120px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                // Next.js tidak menggunakan onError konvensional seperti img html biasa,
                                // jadi sebaiknya handle fallback di level src atau gunakan state jika diperlukan.
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1 p-3 min-w-0">
                            <h3 className="font-bold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold">
                                Ch {item.chapter.split(" ").pop()}
                              </span>
                              <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 rounded-full font-semibold flex items-center gap-1">
                                <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                                {item.popularity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailComic;
