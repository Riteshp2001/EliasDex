// app/comic/page.jsx
import Image from "next/image";
import Link from "next/link";
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
      
      {/* Thumbnail */}
      <Link
        href={`/comic/${slug}`}
        className="relative block aspect-[2/3] overflow-hidden"
      >
        <Image
          src={image || fallbackImage}
          alt={title || "Comic"}
          fill
          unoptimized
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute left-2 right-2 top-2 z-10 flex items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-600/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {type || "Unknown"}
          </span>
          <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-yellow-400 backdrop-blur">
            ⭐ {rating || "N/A"}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        {/* Title */}
        <Link href={`/comic/${slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-indigo-400 md:text-base">
            {title || "Untitled"}
          </h3>
        </Link>

        {/* Meta */}
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

        {/* Chapter */}
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
      className="flex items-center gap-4 rounded-xl p-3 hover:bg-white/5 transition-colors group"
    >
      <span className="text-xl font-bold text-gray-700 group-hover:text-indigo-300 w-8 text-center shrink-0">
        {rank}
      </span>
      <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10">
        <Image src={image} alt={title} fill sizes="48px" className="object-cover" unoptimized />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-gray-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{author}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-bold text-yellow-500">{rating}</span>
        </div>
      </div>
    </Link>
  );
}

// ---------- Pagination Component ----------
function Pagination({ currentPage, totalPages, baseUrl = "/comic" }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          ← Prev
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={`${baseUrl}?page=1`} className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-gray-500 hover:bg-gray-800 hover:text-white transition-all">
            1
          </Link>
          {start > 2 && <span className="px-2 text-gray-600">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={`${baseUrl}?page=${p}`}
          className={`px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
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
            className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
          >
            {totalPages}
          </Link>
        </>
      )}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}

// ---------- Data Fetching ----------
async function getComicData(page = 1) {
  const res = await fetch(
    `https://www.sankavollerei.com/comic/komikindo/latest/${page}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Failed to fetch comic data");
  return res.json();
}

// ---------- Main Page Component ----------
export default async function ComicPage({ searchParams }) {
  // ✅ Await searchParams (Next.js 15+ requirement)
  const awaitedParams = await searchParams;
  const page = Number(awaitedParams?.page) || 1;

  const data = await getComicData(page);
  const { komikList = [], komikPopuler = [], pagination } = data;
  const currentPage = pagination?.currentPage || page;
  const totalPages = pagination?.totalPages || 1;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <SearchComic
            className="w-full max-w-md md:max-w-lg"
            placeholder="Cari komik favoritmu..."
          />
        </div>

        {/* Latest Updates Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Latest Updates
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fresh chapters just dropped – catch up now
              </p>
            </div>
            <span className="text-sm text-gray-600 bg-gray-900 px-3 py-1 rounded-full">
              Page {currentPage} / {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {komikList.map((comic) => (
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

        {/* Popular Comics Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Popular Comics
            </h2>
          </div>

          <div className="grid gap-3 bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/5 shadow-2xl">
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
        </section>

        <footer className="mt-20 text-center text-gray-600 text-sm border-t border-white/5 pt-8">
          © {new Date().getFullYear()} Sanka Comics · Not affiliated with original sources.
        </footer>
      </div>
    </main>
  );
}