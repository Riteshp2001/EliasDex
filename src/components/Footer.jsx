import Logo from "./Logo";
import { FaGithub, FaLinkedin, FaDiscord, FaHeart } from "react-icons/fa6";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              Your ultimate destination to discover and explore anime.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=tv&order_by=start_date&page=1"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Top Anime
                </Link>
              </li>
              <li>
                <Link
                  href="/comic"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Comic Library
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://jikan.moe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Jikan API
                </a>
              </li>
              <li>
                <a
                  href="https://myanimelist.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  MyAnimeList
                </a>
              </li>
              <li>
                <Link
                  href="https://myanimelist.net/about/privacy_policy"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://myanimelist.net/membership/terms_of_use"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Disclaimer */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Connect</h3>
            <div className="flex justify-center md:justify-start gap-4 mb-4">
              <a
                href="https://github.com/Eliasilyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-2xl transition-all duration-200 hover:scale-110"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/farel-hanafi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-2xl transition-all duration-200 hover:scale-110"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://discord.gg/F3NjgWXwKv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-2xl transition-all duration-200 hover:scale-110"
                aria-label="Discord"
              >
                <FaDiscord />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Made with <FaHeart className="inline text-red-500" /> for anime
              lovers.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Disclaimer & Copyright */}
        <div className="text-center">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            EliasDex does not store any files on our server. We only link to
            media hosted on third-party services. All credits go to the
            respective creators and copyright holders.
          </p>
          <p className="mt-4 text-xs text-gray-600">
            © {currentYear} EliasDex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;