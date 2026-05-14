// src/app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowCircleRight,
  FaSearch,
  FaFilm,
  FaBookOpen,
  FaServer,
  FaMobileAlt,
  FaFire,
  FaDiscord,
  FaTwitter,
  FaReddit,
  FaStar,
  FaPlay,
  FaChevronRight,
  FaCheck,
  FaUsers,
  FaGlobe,
  FaShieldAlt,
} from "react-icons/fa";
import { MdHighQuality, MdOutlineUpdate } from "react-icons/md";
import { HiOutlineLibrary, HiOutlineSparkles } from "react-icons/hi";
import { useApi } from "@/services/useApi";
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimeCard from "@/components/AnimeCard";

/* ─── Inline card component to fix the recommendation bug ─── */
function MediaCard({ item, type = "anime" }) {
  const href = type === "manga" ? `/comic/${item.mal_id}` : `/anime/${item.mal_id}`;
  const imageUrl = item.images?.jpg?.image_url || item.images?.webp?.image_url || "/images/placeholder.jpg";

  return (
    <Link href={href} className="media-card group">
      <div className="media-card__poster">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="media-card__img"
          style={{ objectFit: "cover" }}
        />
        <div className="media-card__overlay">
          <div className="media-card__play">{type === "anime" ? <FaPlay /> : <FaBookOpen />}</div>
        </div>
        {item.score && (
          <div className="media-card__score">
            <FaStar className="inline text-amber-400 mr-1" style={{ fontSize: "0.65rem" }} />
            {item.score}
          </div>
        )}
      </div>
      <div className="media-card__info">
        <p className="media-card__title">{item.title}</p>
        <span className="media-card__type">{type === "manga" ? "Manga" : "Anime"}</span>
      </div>
    </Link>
  );
}

/* ─── Stats ─── */
const stats = [
  { value: "10K+", label: "Anime Episodes" },
  { value: "50K+", label: "Manga Chapters" },
  { value: "500K+", label: "Active Fans" },
  { value: "99.9%", label: "Uptime" },
];

/* ─── Features ─── */
const features = [
  {
    icon: <FaFilm />,
    title: "HD Anime Streaming",
    description:
      "Enjoy crystal-clear 1080p and 4K streaming with adaptive bitrate. No buffering, no interruptions — just pure anime.",
    badge: "Popular",
  },
  {
    icon: <FaBookOpen />,
    title: "Manga Library",
    description:
      "Browse thousands of manga titles across every genre. Our reader is optimized for mobile and desktop alike.",
    badge: null,
  },
  {
    icon: <MdHighQuality />,
    title: "Crystal Clear Quality",
    description:
      "From 480p to 4K Ultra HD — choose the quality that fits your connection. Subtitles available in multiple languages.",
    badge: "4K",
  },
  {
    icon: <FaServer />,
    title: "Lightning Fast Servers",
    description:
      "Globally distributed CDN ensures your content loads instantly, no matter where you are on the planet.",
    badge: null,
  },
  {
    icon: <FaMobileAlt />,
    title: "Any Device, Anywhere",
    description:
      "Fully responsive on phone, tablet, or desktop. Your watchlist syncs across all your devices seamlessly.",
    badge: null,
  },
  {
    icon: <HiOutlineLibrary />,
    title: "Massive Collection",
    description:
      "New episodes and chapters added daily. From classic hits to the latest seasonal releases — we have it all.",
    badge: "Daily Updates",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safe & Ad-Free",
    description:
      "No intrusive ads, no malware, no tracking. Just a clean, safe environment to enjoy your favorite content.",
    badge: null,
  },
  {
    icon: <HiOutlineSparkles />,
    title: "Smart Recommendations",
    description:
      "Our AI-powered recommendation engine learns your taste and surfaces hidden gems you will absolutely love.",
    badge: "AI Powered",
  },
  {
    icon: <MdOutlineUpdate />,
    title: "Always Updated",
    description:
      "Simulcast support means the newest episode is available within minutes of its original airing in Japan.",
    badge: null,
  },
];

/* ─── Community perks ─── */
const communityPerks = [
  "Join 500,000+ fans in real-time discussions",
  "Early access to seasonal anime previews",
  "Weekly watchlist recommendations from mods",
  "Fan art showcases and community events",
  "Polls, quizzes, and tournament brackets",
  "Direct feedback channel to our dev team",
];

/* ─── Genres ─── */
const genres = [
  { id: 1, name: "Action", emoji: "⚔️", count: "2,400+" },
  { id: 22, name: "Romance", emoji: "💕", count: "1,800+" },
  { id: 62, name: "Isekai", emoji: "🌀", count: "950+" },
  { id: 14, name: "Horror", emoji: "👻", count: "620+" },
  { id: 18, name: "Mecha", emoji: "🤖", count: "480+" },
  { id: 30, name: "Sports", emoji: "🏆", count: "530+" },
  { id: 10, name: "Fantasy", emoji: "🧙", count: "1,200+" },
  { id: 36, name: "Slice of Life", emoji: "🌸", count: "1,100+" },
  { id: 41, name: "Thriller", emoji: "🔪", count: "390+" },
  { id: 4, name: "Comedy", emoji: "😂", count: "1,600+" },
  { id: 24, name: "Sci-Fi", emoji: "🚀", count: "710+" },
  { id: 7, name: "Mystery", emoji: "🔍", count: "440+" },
];

/* ─── How It Works ─── */
const howItWorks = [
  {
    step: "01",
    title: "Search or Browse",
    description:
      "Use the search bar to find any specific anime or manga title instantly, or browse by genre, season, or trending charts.",
  },
  {
    step: "02",
    title: "Pick an Episode or Chapter",
    description:
      "Select from a full episode list or chapter index. Sub and dub options are clearly labeled so you always watch your preferred version.",
  },
  {
    step: "03",
    title: "Choose Your Quality",
    description:
      "Stream in up to 4K Ultra HD or dial down the resolution for slower connections. Change server with one click if needed.",
  },
  {
    step: "04",
    title: "Enjoy — No Sign-Up Needed",
    description:
      "Just hit play. No account, no credit card, no waiting. Create a free account only if you want to save your watchlist and progress.",
  },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "Ryo K.",
    avatar: "RK",
    country: "🇯🇵 Japan",
    text: "The fastest site I've ever used. New episodes are up within minutes of airing. The 4K quality on my TV is absolutely stunning — exactly what anime deserves.",
    rating: 5,
  },
  {
    name: "María G.",
    avatar: "MG",
    country: "🇲🇽 Mexico",
    text: "I've tried dozens of streaming sites and this is the only one that actually works on mobile without constant buffering or annoying pop-ups. My go-to for everything.",
    rating: 5,
  },
  {
    name: "Liam T.",
    avatar: "LT",
    country: "🇬🇧 UK",
    text: "The manga reader is incredibly smooth. Night mode, page flip animations, and it remembers exactly where I left off. Better than most paid apps honestly.",
    rating: 5,
  },
  {
    name: "Aisha B.",
    avatar: "AB",
    country: "🇳🇬 Nigeria",
    text: "Finally a platform that works well even on a 3G connection. The adaptive quality is a game changer. I can watch anywhere without worrying about data.",
    rating: 5,
  },
  {
    name: "Chen W.",
    avatar: "CW",
    country: "🇸🇬 Singapore",
    text: "The AI recommendations actually work. It found shows I've never heard of that I now absolutely love. The community Discord is super active and welcoming too.",
    rating: 5,
  },
  {
    name: "Priya S.",
    avatar: "PS",
    country: "🇮🇳 India",
    text: "Both sub and dub for almost everything — that's rare. The clean interface makes it so easy to navigate. I've converted all my friends to this platform.",
    rating: 5,
  },
];

/* ─── FAQ ─── */
const faqs = [
  {
    q: "Is EliasDex completely free to use?",
    a: "Yes, 100% free. You can watch anime and read manga without ever entering a credit card or creating an account. A free account is optional and only needed if you want to save your watchlist and sync progress across devices.",
  },
  {
    q: "Do I need to register to watch?",
    a: "No registration required. Just visit the site, find what you want to watch, and hit play. Creating a free account is optional but unlocks features like a personal watchlist, reading history, and cross-device sync.",
  },
  {
    q: "What video quality is available?",
    a: "We offer a full range from 360p all the way up to 4K Ultra HD, depending on the title. Our adaptive bitrate system automatically selects the best quality for your connection, but you can always override it manually.",
  },
  {
    q: "How quickly are new episodes added?",
    a: "Our system is fully automated to scan for new content the moment it airs. Most simulcast episodes are available within minutes of their original Japanese broadcast — often before the episode trends on social media.",
  },
  {
    q: "Is the site safe to use?",
    a: "Absolutely. We do not use malicious pop-ups, auto-redirect ads, or any tracking scripts beyond basic analytics. Our team actively monitors the platform and our community can flag any issues directly through the report button on every page.",
  },
  {
    q: "Can I watch on my phone or TV?",
    a: "Yes. EliasDex is fully responsive and works on any device — smartphones, tablets, laptops, desktops, and Smart TVs via the built-in browser. No app download needed; everything runs in your browser.",
  },
  {
    q: "Are both sub and dub versions available?",
    a: "For the vast majority of titles, yes. Sub (original Japanese audio with subtitles) and dub (English voice-over) are both available and clearly labeled. You can switch between them at any time on the episode page.",
  },
  {
    q: "What should I do if a video is not loading?",
    a: "Try switching to a different server — you'll find server options right below the video player. If the issue persists, use the report button on the episode page and our team will investigate it quickly.",
  },
];

export default function RootPage() {
  const [value, setValue] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const router = useRouter();

  const changeInput = (e) => setValue(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) router.push(`/search?keyword=${encodeURIComponent(value)}`);
  };

  const {
    data: animeRecData,
    isLoading: animeLoading,
    isError: animeError,
  } = useApi("/top/anime?filter=airing&sfw=true&order_by=score&type=tv");
  const trendingAnime =
    animeRecData?.data
      ?.filter((item, index, self) => self.findIndex((a) => a.mal_id === item.mal_id) === index)
      .slice(0, 8) || [];

  const { data: mangaRecData, isLoading: mangaLoading, isError: mangaError } = useApi("/recommendations/manga");
  const popularManga =
    mangaRecData?.data
      ?.flatMap((rec) => rec.entry)
      .filter((item, index, self) => self.findIndex((i) => i.mal_id === item.mal_id) === index)
      .slice(0, 8) || [];
  return (
    <div className="ed-root">
      {/* <Navbar /> */}

      {/* ══════════════════ HERO ══════════════════ */}
      <section
        className="ed-hero"
        style={{ backgroundImage: `url('/images/background.jpg')` }}
        aria-label="Hero section"
      >
        <div className="ed-hero__glow" aria-hidden="true" />
        <div className="ed-container ed-hero__inner">
          {/* Left */}
          <div className="ed-hero__copy">
            <span className="ed-badge ed-badge--amber mb-4">
              <FaFire className="inline mr-1 text-amber-400" /> New Season Airing Now
            </span>
            <div className="mb-6 ed-hero__logo">
              <Logo />
            </div>
            <h1 className="ed-hero__title">
              Stream Anime &amp;
              <br />
              <span className="ed-highlight">Read Manga</span>
              <br />
              All in One Place
            </h1>
            <p className="ed-hero__sub">
              Discover thousands of anime episodes and manga chapters. Watch in HD, read online, and track your
              favorites — completely free.
            </p>

            {/* Search */}
            <form onSubmit={handleSubmit} className="ed-search" role="search" aria-label="Search anime or manga">
              <FaSearch className="ed-search__icon" aria-hidden="true" />
              <input
                value={value}
                onChange={changeInput}
                type="search"
                placeholder="Search anime or manga..."
                className="ed-search__input"
                aria-label="Search query"
              />
              <button type="submit" className="ed-search__btn">
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div className="ed-hero__ctas">
              <Link href="/home" className="ed-btn ed-btn--primary">
                <FaPlay className="mr-2" /> Explore Anime
              </Link>
              <Link href="/comic" className="ed-btn ed-btn--ghost">
                <FaBookOpen className="mr-2" /> Read Manga
              </Link>
            </div>
          </div>

          {/* Right — banner */}
          <div className="ed-hero__visual" aria-hidden="true">
            <div className="ed-hero__glow-ring" />
            <Image
              className="ed-hero__banner"
              src="/images/homeBanner.png"
              alt="Anime and Manga characters"
              width={480}
              height={480}
              priority
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="ed-container">
          <div className="ed-stats" role="list" aria-label="Platform statistics">
            {stats.map((s) => (
              <div key={s.label} className="ed-stats__item" role="listitem">
                <span className="ed-stats__value">{s.value}</span>
                <span className="ed-stats__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY US — FEATURE HIGHLIGHTS ══════════════════ */}
      <section className="ed-section" aria-labelledby="features-heading">
        <div className="ed-container">
          <div className="ed-section__header">
            <span className="ed-eyebrow">Why EliasDex?</span>
            <h2 id="features-heading" className="ed-section__title">
              Everything You Need for the
              <br />
              <span className="ed-highlight">Ultimate Experience</span>
            </h2>
            <p className="ed-section__sub">
              Built from the ground up for anime and manga enthusiasts who demand quality, speed, and reliability.
            </p>
          </div>

          <div className="ed-features-grid">
            {features.map((f, i) => (
              <article key={i} className="ed-feature-card">
                <div className="ed-feature-card__icon" aria-hidden="true">
                  {f.icon}
                </div>
                {f.badge && <span className="ed-badge ed-badge--sm ed-badge--amber mb-2">{f.badge}</span>}
                <h3 className="ed-feature-card__title">{f.title}</h3>
                <p className="ed-feature-card__desc">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ ANIME RECOMMENDATIONS ══════════════════ */}
      <section className="ed-section ed-section--surface" aria-labelledby="anime-rec-heading">
        <div className="ed-container">
          <div className="ed-section__row-header">
            <div>
              <span className="ed-eyebrow">Hand-picked for You</span>
              <h2 id="anime-rec-heading" className="ed-section__title--sm">
                <FaFire className="inline text-orange-400 mr-2" />
                Anime Recommendations
              </h2>
              <p className="ed-section__sub--sm">Curated picks loved by our community this season</p>
            </div>
            <Link href="/search?order_by=score&sfw=false&page=1" className="ed-link-more">
              View All <FaChevronRight className="ml-1 text-xs" />
            </Link>
          </div>

          {!animeLoading && !animeError && (
            <div className="ed-media-grid">
              {trendingAnime.map((item) => (
                <MediaCard key={item.mal_id} item={item} type="anime" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ MANGA RECOMMENDATIONS ══════════════════ */}
      <section className="ed-section" aria-labelledby="manga-rec-heading">
        <div className="ed-container">
          <div className="ed-section__row-header">
            <div>
              <span className="ed-eyebrow">Popular in the Library</span>
              <h2 id="manga-rec-heading" className="ed-section__title--sm">
                <FaBookOpen className="inline text-emerald-400 mr-2" />
                Manga Recommendations
              </h2>
              <p className="ed-section__sub--sm">Top manga picks recommended by fans worldwide</p>
            </div>
            <Link href="/comic" className="ed-link-more">
              View All <FaChevronRight className="ml-1 text-xs" />
            </Link>
          </div>

          {!mangaLoading && !mangaError && (
            <div className="ed-media-grid">
              {popularManga.map((item) => (
                <MediaCard key={item.mal_id} item={item} type="manga" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ COMMUNITY / DISCORD ══════════════════ */}
      <section className="ed-section ed-section--surface" aria-labelledby="community-heading">
        <div className="ed-container">
          <div className="ed-community">
            {/* Left copy */}
            <div className="ed-community__copy">
              <span className="ed-eyebrow">Join the Family</span>
              <h2 id="community-heading" className="ed-section__title">
                One Community.
                <br />
                <span className="ed-highlight">EliasDex.</span>
              </h2>
              <p className="ed-section__sub" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                Connect with fellow anime and manga lovers in our Discord server. Discuss your favourite series,
                discover hidden gems, and be the first to know about new releases and platform updates.
              </p>

              <ul className="ed-community__perks" aria-label="Community benefits">
                {communityPerks.map((p) => (
                  <li key={p}>
                    <FaCheck className="ed-community__check" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="ed-community__ctas">
                <a
                  href="https://discord.gg/F3NjgWXwKv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-btn ed-btn--discord"
                  aria-label="Join EliasDex Discord server"
                >
                  <FaDiscord className="mr-2 text-lg" /> Join Discord Server
                </a>
                {/* <a
                  href="https://reddit.com/r/eliasdex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-btn ed-btn--ghost"
                  aria-label="Visit EliasDex subreddit"
                >
                  <FaReddit className="mr-2" /> Reddit Community
                </a> */}
              </div>
            </div>

            {/* Right visual — real Discord widget */}
            <div className="ed-community__visual">
              <div className="ed-discord-widget-wrap">
                <iframe
                  src="https://discord.com/widget?id=1430495542810509384&theme=dark"
                  width="100%"
                  height="500"
                  allowtransparency="true"
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  title="EliasDex Discord Server"
                  style={{ borderRadius: "12px", display: "block" }}
                />
              </div>

              {/* Floating badges */}
              {/* <div className="ed-community__badge ed-community__badge--tl">
                <FaUsers className="inline mr-1" /> 500K Members
              </div>
              <div className="ed-community__badge ed-community__badge--br">
                <FaGlobe className="inline mr-1" /> 140+ Countries
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="ed-section" aria-labelledby="how-heading">
        <div className="ed-container">
          <div className="ed-section__header">
            <span className="ed-eyebrow">Simple as 1-2-3</span>
            <h2 id="how-heading" className="ed-section__title">
              How to Get Started in
              <br />
              <span className="ed-highlight">Under 30 Seconds</span>
            </h2>
            <p className="ed-section__sub">
              No sign-ups, no setup, no fuss. Just find your show and start watching instantly.
            </p>
          </div>
          <div className="ed-how-grid">
            {howItWorks.map((step) => (
              <div key={step.step} className="ed-how-card">
                <div className="ed-how-card__step">{step.step}</div>
                <h3 className="ed-how-card__title">{step.title}</h3>
                <p className="ed-how-card__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ GENRE SHOWCASE ══════════════════ */}
      <section className="ed-section ed-section--surface" aria-labelledby="genre-heading">
        <div className="ed-container">
          <div className="ed-section__header">
            <span className="ed-eyebrow">Something for Everyone</span>
            <h2 id="genre-heading" className="ed-section__title">
              Explore by <span className="ed-highlight">Genre</span>
            </h2>
            <p className="ed-section__sub">
              From heart-pounding action to wholesome slice of life — we cover every corner of the anime and manga
              universe.
            </p>
          </div>
          <div className="ed-genre-grid">
            {genres.map((g) => (
              <Link key={g.id} href={`/search?genres=${g.id}`} className="ed-genre-card">
                <span className="ed-genre-card__emoji" aria-hidden="true">
                  {g.emoji}
                </span>
                <span className="ed-genre-card__name">{g.name}</span>
                <span className="ed-genre-card__count">{g.count} titles</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="ed-section" aria-labelledby="testimonials-heading">
        <div className="ed-container">
          <div className="ed-section__header">
            <span className="ed-eyebrow">Loved by Millions</span>
            <h2 id="testimonials-heading" className="ed-section__title">
              What Our <span className="ed-highlight">Community</span> Says
            </h2>
            <p className="ed-section__sub">Real fans from 140+ countries share their experience with EliasDex.</p>
          </div>
          <div className="ed-testimonials-grid">
            {testimonials.map((t) => (
              <article key={t.name} className="ed-testimonial-card">
                <div className="ed-testimonial-card__stars" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FaStar key={i} className="inline text-amber-400" style={{ fontSize: "0.75rem" }} />
                  ))}
                </div>
                <p className="ed-testimonial-card__text">&ldquo;{t.text}&rdquo;</p>
                <div className="ed-testimonial-card__author">
                  <div className="ed-testimonial-card__avatar" aria-hidden="true">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="ed-testimonial-card__name">{t.name}</p>
                    <p className="ed-testimonial-card__country">{t.country}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="ed-section ed-section--surface" aria-labelledby="faq-heading">
        <div className="ed-container">
          <div className="ed-section__header">
            <span className="ed-eyebrow">Got Questions?</span>
            <h2 id="faq-heading" className="ed-section__title">
              Frequently Asked <span className="ed-highlight">Questions</span>
            </h2>
            <p className="ed-section__sub">
              Everything you need to know about EliasDex. Can&apos;t find your answer? Reach out to us on Discord.
            </p>
          </div>
          <div className="ed-faq-list" role="list">
            {faqs.map((faq, i) => (
              <div key={i} className={`ed-faq-item${openFaq === i ? " ed-faq-item--open" : ""}`} role="listitem">
                <button
                  className="ed-faq-item__question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <FaChevronRight
                    className={`ed-faq-item__chevron${openFaq === i ? " ed-faq-item__chevron--open" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === i && (
                  <div className="ed-faq-item__answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="ed-cta" aria-labelledby="cta-heading">
        <div className="ed-cta__glow" aria-hidden="true" />
        <div className="ed-container ed-cta__inner">
          <span className="ed-eyebrow ed-eyebrow--dark">100% Free Forever</span>
          <h2 id="cta-heading" className="ed-cta__title">
            Ready to Start Your
            <br />
            Anime Journey?
          </h2>
          <p className="ed-cta__sub">
            No credit card. No subscription. No ads. Just pure anime and manga bliss, forever free.
          </p>
          <div className="ed-cta__btns">
            <Link href="/register" className="ed-btn ed-btn--dark">
              Create Free Account
            </Link>
            <Link href="/home" className="ed-btn ed-btn--outline-dark">
              Browse Content
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <Footer />

      {/* ══════════════════ GLOBAL STYLES ══════════════════ */}
      <style>{`
        /* ── Variables ── */
        :root {
          --bg:        #0B0E14;
          --surface:   #151921;
          --surface2:  #1C2333;
          --accent:    #F59E0B;
          --accent-h:  #D97706;
          --text:      #E2E8F0;
          --text-muted:#94A3B8;
          --border:    rgba(255,255,255,0.07);
          --radius:    14px;
          --radius-sm: 8px;
          --trans:     all 0.25s cubic-bezier(.4,0,.2,1);
        }

        /* ── Base ── */
        .ed-root {
          background: var(--bg);
          color: var(--text);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }

        /* ── Container ── */
        .ed-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        @media (min-width: 768px) {
          .ed-container { padding: 0 2rem; }
        }

        /* ── Eyebrow ── */
        .ed-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.6rem;
        }
        .ed-eyebrow--dark {
          color: rgba(0,0,0,0.7);
        }

        /* ── Badge ── */
        .ed-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .ed-badge--amber {
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.35);
          color: var(--accent);
        }
        .ed-badge--sm { font-size: 0.65rem; padding: 0.2rem 0.55rem; }

        /* ── Highlight ── */
        .ed-highlight {
          background: linear-gradient(135deg, #F59E0B, #FBBF24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ══════ HERO ══════ */
        .ed-hero {
          position: relative;
          background-size: cover;
          background-position: center;
          padding: 5rem 0 3rem;
          overflow: hidden;
        }
        .ed-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,
            rgba(11,14,20,0.97) 0%,
            rgba(11,14,20,0.85) 50%,
            rgba(11,14,20,0.70) 100%
          );
          z-index: 0;
        }
        .ed-hero__glow {
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .ed-hero__inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        @media (min-width: 1024px) {
          .ed-hero__inner {
            flex-direction: row;
            align-items: center;
          }
        }

        /* copy */
        .ed-hero__copy {
          flex: 1;
          text-align: center;
        }
        @media (min-width: 1024px) {
          .ed-hero__copy { text-align: left; }
        }
        .ed-hero__title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }
        .ed-hero__sub {
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        @media (min-width: 1024px) {
          .ed-hero__sub { margin-left: 0; }
        }

        /* search */
        .ed-search {
          display: flex;
          align-items: center;
          position: relative;
          max-width: 480px;
          margin: 0 auto 1.75rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          backdrop-filter: blur(8px);
          transition: var(--trans);
        }
        .ed-search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
        }
        @media (min-width: 1024px) {
          .ed-search { margin-left: 0; }
        }
        .ed-search__icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          pointer-events: none;
        }
        .ed-search__input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 0.95rem;
          padding: 0.9rem 1rem 0.9rem 2.75rem;
        }
        .ed-search__input::placeholder { color: var(--text-muted); }
        .ed-search__btn {
          background: var(--accent);
          color: #000;
          font-weight: 700;
          font-size: 0.875rem;
          padding: 0.75rem 1.25rem;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--trans);
        }
        .ed-search__btn:hover { background: var(--accent-h); }

        /* cta buttons */
        .ed-hero__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .ed-hero__ctas { justify-content: flex-start; }
        }

        /* visual */
        .ed-hero__visual {
          flex: 1;
          display: none;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        @media (min-width: 1024px) {
          .ed-hero__visual { display: flex; }
        }
        .ed-hero__glow-ring {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
          animation: pulse-ring 3s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .ed-hero__banner {
          width: 100%;
          max-width: 420px;
          height: auto;
          animation: float 4s ease-in-out infinite;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 20px 60px rgba(245,158,11,0.2));
          will-change: transform;
        }

        /* stats bar */
        .ed-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-top: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 640px) {
          .ed-stats { grid-template-columns: repeat(4, 1fr); }
        }
        .ed-stats__item {
          background: rgba(21,25,33,0.85);
          backdrop-filter: blur(8px);
          padding: 1.25rem 1rem;
          text-align: center;
        }
        .ed-stats__value {
          display: block;
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .ed-stats__label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ══════ BUTTONS ══════ */
        .ed-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--trans);
          border: none;
          text-decoration: none;
          white-space: nowrap;
        }
        .ed-btn--primary {
          background: var(--accent);
          color: #000;
        }
        .ed-btn--primary:hover {
          background: var(--accent-h);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(245,158,11,0.35);
        }
        .ed-btn--ghost {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
        }
        .ed-btn--ghost:hover {
          background: var(--surface2);
          border-color: rgba(255,255,255,0.15);
        }
        .ed-btn--discord {
          background: #5865F2;
          color: #fff;
        }
        .ed-btn--discord:hover {
          background: #4752C4;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(88,101,242,0.4);
        }
        .ed-btn--dark {
          background: #000;
          color: #fff;
        }
        .ed-btn--dark:hover {
          background: #111;
          transform: translateY(-1px);
        }
        .ed-btn--outline-dark {
          background: transparent;
          color: #000;
          border: 2px solid rgba(0,0,0,0.4);
        }
        .ed-btn--outline-dark:hover {
          background: rgba(0,0,0,0.08);
        }

        /* ══════ SECTION ══════ */
        .ed-section {
          padding: 5rem 0;
        }
        .ed-section--surface {
          background: var(--surface);
        }
        .ed-section__header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 3.5rem;
        }
        .ed-section__title {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .ed-section__title--sm {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }
        .ed-section__sub {
          color: var(--text-muted);
          font-size: 1rem;
          line-height: 1.7;
          text-align: center;
        }
        .ed-section__sub--sm {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .ed-section__row-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .ed-link-more {
          display: inline-flex;
          align-items: center;
          color: var(--accent);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: var(--trans);
          white-space: nowrap;
        }
        .ed-link-more:hover { opacity: 0.8; }

        /* ══════ FEATURES GRID ══════ */
        .ed-features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .ed-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-features-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .ed-feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem;
          transition: var(--trans);
          display: flex;
          flex-direction: column;
        }
        .ed-feature-card:hover {
          border-color: rgba(245,158,11,0.3);
          background: var(--surface2);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .ed-feature-card__icon {
          font-size: 2rem;
          color: var(--accent);
          margin-bottom: 1rem;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,158,11,0.1);
          border-radius: var(--radius-sm);
        }
        .ed-feature-card__title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
          color: var(--text);
        }
        .ed-feature-card__desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.65;
          flex: 1;
        }

        /* ══════ MEDIA CARD (fix recommendation bug) ══════ */
        .ed-media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 480px) {
          .ed-media-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 640px) {
          .ed-media-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-media-grid { grid-template-columns: repeat(8, 1fr); }
        }

        .media-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: var(--text);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface2);
          border: 1px solid var(--border);
          transition: var(--trans);
        }
        .media-card:hover {
          border-color: rgba(245,158,11,0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        .media-card__poster {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: var(--surface);
        }
        .media-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
          display: block;
        }
        .media-card:hover .media-card__img {
          transform: scale(1.06);
        }
        .media-card__overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--trans);
        }
        .media-card:hover .media-card__overlay {
          background: rgba(0,0,0,0.45);
        }
        .media-card__play {
          width: 44px;
          height: 44px;
          background: var(--accent);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          opacity: 0;
          transform: scale(0.6);
          transition: var(--trans);
          padding-left: 3px;
        }
        .media-card:hover .media-card__play {
          opacity: 1;
          transform: scale(1);
        }
        .media-card__score {
          position: absolute;
          top: 0.4rem;
          right: 0.4rem;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.4rem;
          color: #fff;
          display: flex;
          align-items: center;
        }
        .media-card__info {
          padding: 0.6rem 0.65rem 0.75rem;
        }
        .media-card__title {
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.35rem;
          color: var(--text);
        }
        .media-card__type {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(245,158,11,0.1);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        /* loader / error */
        .ed-loader-wrap {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
        }
        .ed-error {
          text-align: center;
          color: #F87171;
          padding: 3rem 0;
          font-size: 0.9rem;
        }

        /* ══════ COMMUNITY ══════ */
        .ed-community {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .ed-community {
            flex-direction: row;
            gap: 4rem;
            align-items: flex-start;
          }
        }
        .ed-community__copy { flex: 1; }
        .ed-community__perks {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .ed-community__perks li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .ed-community__check {
          color: var(--accent);
          flex-shrink: 0;
          font-size: 0.75rem;
        }
        .ed-community__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* visual side */
        .ed-community__visual {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 360px;
        }
        /* Discord widget iframe wrapper */
        .ed-discord-widget-wrap {
          width: 100%;
          max-width: 360px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          border: 1px solid rgba(88,101,242,0.3);
        }

        /* ── Hero Logo responsive hide ── */
        /* hide on portrait mobile */
        @media (max-width: 639px) {
          .ed-hero__logo { display: none; }
        }
        /* hide on landscape orientation (any device) */
        @media (orientation: landscape) and (max-height: 500px) {
          .ed-hero__logo { display: none; }
        }

        /* floating badges */
        .ed-community__badge {
          position: absolute;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 0.45rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .ed-community__badge--tl {
          top: 1rem;
          left: -1rem;
          color: var(--accent);
          border-color: rgba(245,158,11,0.3);
          background: rgba(245,158,11,0.08);
        }
        .ed-community__badge--br {
          bottom: 1rem;
          right: -1rem;
        }
        @media (max-width: 1023px) {
          .ed-community__badge--tl { left: 0; top: -1rem; }
          .ed-community__badge--br { right: 0; bottom: -1rem; }
        }

        /* ══════ HOW IT WORKS ══════ */
        .ed-how-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          counter-reset: none;
        }
        @media (min-width: 640px) {
          .ed-how-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-how-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .ed-how-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.5rem;
          position: relative;
          transition: var(--trans);
        }
        .ed-how-card:hover {
          border-color: rgba(245,158,11,0.4);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .ed-how-card__step {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          letter-spacing: -0.04em;
        }
        .ed-how-card__title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .ed-how-card__desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.65;
        }

        /* ══════ GENRE SHOWCASE ══════ */
        .ed-genre-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        @media (min-width: 480px) {
          .ed-genre-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 768px) {
          .ed-genre-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-genre-grid { grid-template-columns: repeat(6, 1fr); }
        }
        .ed-genre-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem 1rem;
          text-align: center;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          transition: var(--trans);
        }
        .ed-genre-card:hover {
          border-color: rgba(245,158,11,0.45);
          background: rgba(245,158,11,0.06);
          transform: translateY(-2px);
        }
        .ed-genre-card__emoji {
          font-size: 1.75rem;
          line-height: 1;
        }
        .ed-genre-card__name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text);
        }
        .ed-genre-card__count {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* ══════ TESTIMONIALS ══════ */
        .ed-testimonials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .ed-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-testimonials-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .ed-testimonial-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: var(--trans);
        }
        .ed-testimonial-card:hover {
          border-color: rgba(245,158,11,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .ed-testimonial-card__stars {
          display: flex;
          gap: 0.2rem;
        }
        .ed-testimonial-card__text {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.7;
          flex: 1;
          font-style: italic;
        }
        .ed-testimonial-card__author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }
        .ed-testimonial-card__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F59E0B, #FBBF24);
          color: #000;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ed-testimonial-card__name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text);
        }
        .ed-testimonial-card__country {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* ══════ FAQ ══════ */
        .ed-faq-list {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ed-faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .ed-faq-item--open {
          border-color: rgba(245,158,11,0.4);
        }
        .ed-faq-item__question {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 1.25rem 1.5rem;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          transition: var(--trans);
        }
        .ed-faq-item__question:hover { color: var(--accent); }
        .ed-faq-item__chevron {
          flex-shrink: 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        .ed-faq-item__chevron--open {
          transform: rotate(90deg);
          color: var(--accent);
        }
        .ed-faq-item__answer {
          padding: 0 1.5rem 1.25rem;
        }
        .ed-faq-item__answer p {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.75;
        }

        /* ══════ CTA BANNER ══════ */
        .ed-cta {
          background: linear-gradient(135deg, #F59E0B, #FBBF24 40%, #FCD34D);
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }
        .ed-cta__glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .ed-cta__inner {
          position: relative;
          text-align: center;
        }
        .ed-cta__title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 900;
          color: #000;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0.75rem 0 1rem;
        }
        .ed-cta__sub {
          color: rgba(0,0,0,0.65);
          font-size: 1.05rem;
          max-width: 500px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .ed-cta__btns {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }

        /* ══════ FOOTER ══════ */
        .ed-footer {
          background: #0A0D12;
          border-top: 1px solid var(--border);
          padding: 4rem 0 2rem;
        }
        .ed-footer__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 640px) {
          .ed-footer__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ed-footer__grid { grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; gap: 2rem; }
        }
        .ed-footer__brand-desc {
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.7;
          margin: 1rem 0 1.25rem;
        }
        .ed-footer__social {
          display: flex;
          gap: 0.75rem;
        }
        .ed-footer__social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 1rem;
          text-decoration: none;
          transition: var(--trans);
        }
        .ed-footer__social a:hover {
          background: var(--surface);
          color: var(--accent);
          border-color: rgba(245,158,11,0.3);
        }
        .ed-footer__col-title {
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .ed-footer__links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .ed-footer__links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.875rem;
          transition: var(--trans);
        }
        .ed-footer__links a:hover { color: var(--accent); }
        .ed-footer__newsletter-desc {
          color: var(--text-muted);
          font-size: 0.82rem;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .ed-footer__newsletter {
          display: flex;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .ed-footer__email-input {
          flex: 1;
          background: var(--surface2);
          border: none;
          outline: none;
          color: var(--text);
          font-size: 0.82rem;
          padding: 0.65rem 0.75rem;
          min-width: 0;
        }
        .ed-footer__email-input::placeholder { color: var(--text-muted); }
        .ed-footer__email-btn {
          background: var(--accent);
          color: #000;
          border: none;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 0.65rem 0.9rem;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--trans);
        }
        .ed-footer__email-btn:hover { background: var(--accent-h); }
        .ed-footer__newsletter-note {
          color: var(--text-muted);
          font-size: 0.72rem;
          margin-top: 0.4rem;
          opacity: 0.7;
        }
        .ed-footer__bottom {
          border-top: 1px solid var(--border);
          padding-top: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        @media (min-width: 640px) {
          .ed-footer__bottom {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }

        /* ══════ ANIMATIONS ══════ */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-18px); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50%       { transform: scale(1.05); opacity: 1; }
        }

        /* ══════ PERFORMANCE — will-change hints ══════ */
        .media-card,
        .ed-feature-card,
        .ed-btn {
          will-change: transform;
        }

        /* ══════ REDUCED MOTION — old/low-power devices ══════ */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .ed-hero__banner,
          .ed-hero__glow-ring {
            animation: none !important;
            will-change: auto;
          }
          .media-card:hover,
          .ed-feature-card:hover,
          .ed-btn--primary:hover,
          .ed-btn--dark:hover,
          .ed-btn--discord:hover {
            transform: none !important;
          }
        }

        /* ══════ FOCUS / A11Y ══════ */
        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
