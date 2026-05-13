// app/comic/page.jsx
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SearchComic from "@/components/comic/Home/SearchComic";

// ---------- Comic Card Component ----------
export function ComicCard({
  title,
  slug,
  image,
  type,
  rating,
  chapter,
}) {
  const fallbackImage = "/placeholder-comic.jpg";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/5 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10">
      <Link
        href={`/comic/${slug}`}
        className="relative block aspect-[2/3] overflow-hidden"
      >
        <Image
          src={image || fallbackImage}
          alt={title || "Comic cover"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute left-2 right-2 top-2 z-10 flex items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-600/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {type || "Unknown"}
          </span>
          <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-yellow-400 backdrop-blur">
            ⭐ {rating || "N/A"}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/comic/${slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-indigo-400 md:text-base">
            {title || "Untitled"}
          </h3>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-md bg-white/5 px-2 py-1 text-gray-300">
            {type || "Unknown"}
          </span>
          {rating ? (
            <span className="rounded-md bg-yellow-500/10 px-2 py-1 text-yellow-400">
              ⭐ {rating}
            </span>
          ) : (
            <span className="rounded-md bg-white/5 px-2 py-1 text-gray-500">
              No Rating
            </span>
          )}
        </div>
        {chapter && (
          <Link
            href={`/comic/${slug}/${chapter.slug}`}
            className="mt-auto flex items-center justify-between border-t border-white/5 pt-3"
          >
            <span className="max-w-[65%] truncate text-xs font-medium text-gray-400">
              {chapter.title || "Latest Chapter"}
            </span>
            <span className="shrink-0 text-[11px] text-gray-500">
              {chapter.date || "Recently"}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}

// ---------- Popular Item Component ----------
function PopularItem({ rank, title, author, rating, image, slug }) {
  return (
    <Link
      href={`/comic/${slug}`}
      className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5 group"
    >
      <span className="w-8 shrink-0 text-center text-xl font-bold text-gray-700 transition-colors group-hover:text-indigo-300">
        {rank}
      </span>
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10">
        <Image
          src={image}
          alt={title}
          fill
          sizes="48px"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-1 text-sm font-semibold text-gray-200 transition-colors group-hover:text-indigo-400">
          {title}
        </h4>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{author}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-bold text-yellow-500">{rating}</span>
        </div>
      </div>
    </Link>
  );
}

// ---------- Pagination Component (RESPONSIVE) ----------
function Pagination({ currentPage, totalPages, baseUrl = "/comic" }) {
  // Responsive: di mobile (max-width:640px) tampilkan versi sederhana
  // Kita gunakan CSS media query via class hidden sm:flex
  // Namun lebih baik render dua struktur berbeda berdasarkan conditional?
  // Karena ini server component, kita bisa tetap render satu struktur yang pakai class responsive.
  // Pendekatan: tampilkan versi lengkap untuk desktop, versi ringkas untuk mobile.
  // Di mobile: Prev, nomor saat ini, Next + teks total halaman.
  // Di desktop: seperti sebelumnya dengan 5 tombol + elipsis.

  // Versi desktop (sm:flex) & versi mobile (flex sm:hidden)
  return (
    <nav className="mt-12 flex flex-col items-center gap-2 sm:gap-1.5" aria-label="Pagination">
      {/* Mobile version (visible di bawah 640px) */}
      <div className="flex w-full justify-center gap-2 sm:hidden">
        {currentPage > 1 && (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
            aria-label="Previous page"
          >
            ← Prev
          </Link>
        )}
        <span className="rounded-xl bg-indigo-600/20 px-3 py-2 text-sm font-semibold text-white">
          {currentPage} / {totalPages}
        </span>
        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
            aria-label="Next page"
          >
            Next →
          </Link>
        )}
      </div>

      {/* Desktop version (hidden di mobile, flex di sm) */}
      <div className="hidden sm:flex sm:items-center sm:justify-center sm:gap-1.5">
        {currentPage > 1 && (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
            aria-label="Previous page"
          >
            ← Prev
          </Link>
        )}
        {(() => {
          const pages = [];
          const maxVisible = 5;
          let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
          let end = Math.min(totalPages, start + maxVisible - 1);
          if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
          for (let i = start; i <= end; i++) pages.push(i);
          return (
            <>
              {start > 1 && (
                <>
                  <Link
                    href={`${baseUrl}?page=1`}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-800 hover:text-white"
                  >
                    1
                  </Link>
                  {start > 2 && <span className="px-2 text-gray-600">…</span>}
                </>
              )}
              {pages.map((p) => (
                <Link
                  key={p}
                  href={`${baseUrl}?page=${p}`}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    p === currentPage
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {end < totalPages && (
                <>
                  {end < totalPages - 1 && <span className="px-2 text-gray-600">…</span>}
                  <Link
                    href={`${baseUrl}?page=${totalPages}`}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-800 hover:text-white"
                  >
                    {totalPages}
                  </Link>
                </>
              )}
            </>
          );
        })()}
        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
            aria-label="Next page"
          >
            Next →
          </Link>
        )}
      </div>
    </nav>
  );
}

// ---------- Data Fetching ----------
async function getComicData(page = 1) {
  try {
    const res = await fetch(
      `https://www.sankavollerei.com/comic/komikindo/latest/${page}`,
      {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    return {
      komikList: data.komikList || [],
      komikPopuler: data.komikPopuler || [],
      pagination: data.pagination || { currentPage: page, totalPages: 1 },
    };
  } catch (err) {
    console.error("Error fetching comics:", err);
    return {
      komikList: [],
      komikPopuler: [],
      pagination: { currentPage: page, totalPages: 1 },
    };
  }
}

// ---------- Main Page Component ----------
export default async function ComicPage({ searchParams }) {
  const awaitedParams = await searchParams;
  const page = Number(awaitedParams?.page) || 1;

  const { komikList, komikPopuler, pagination } = await getComicData(page);
  const currentPage = pagination?.currentPage || page;
  const totalPages = pagination?.totalPages || 1;

  // Pisahkan komik untuk prioritas (tidak terlalu diperlukan, tapi aman)
  const prioritizedComics = komikList.slice(0, 6);
  const restComics = komikList.slice(6);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-screen-xl px-4 py-6 md:py-10">
        <div className="mb-8 flex justify-center md:mb-12">
          <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-xl bg-gray-800" />}>
            <SearchComic
              className="w-full max-w-md md:max-w-lg"
              placeholder="Cari komik favoritmu..."
            />
          </Suspense>
        </div>

        <section className="mb-12 md:mb-16">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 md:mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Latest Updates
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Fresh chapters just dropped – catch up now
              </p>
            </div>
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs text-gray-600 sm:text-sm">
              Page {currentPage} / {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {prioritizedComics.map((comic) => (
              <ComicCard
                key={comic.slug}
                title={comic.title}
                slug={comic.slug}
                image={comic.image}
                type={comic.type}
                chapter={comic.chapters?.[0]}
              />
            ))}
            {restComics.map((comic) => (
              <ComicCard
                key={comic.slug}
                title={comic.title}
                slug={comic.slug}
                image={comic.image}
                type={comic.type}
                chapter={comic.chapters?.[0]}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/comic"
            />
          )}
        </section>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <svg className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Popular Comics
            </h2>
          </div>

          <div className="rounded-2xl bg-gray-900/60 p-3 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm sm:p-4">
            <div className="divide-y divide-white/5">
              {komikPopuler.map((comic) => (
                <PopularItem
                  key={comic.rank}
                  rank={comic.rank}
                  title={comic.title}
                  author={comic.author}
                  rating={comic.rating}
                  image={comic.image}
                  slug={comic.slug}
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-gray-600 sm:mt-20 sm:text-sm">
          © {new Date().getFullYear()} Sanka Comics · Not affiliated with original sources.
        </footer>
      </div>
    </main>
  );
}