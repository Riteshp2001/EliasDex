// Sidebar.jsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";
import useSidebarStore from "@/store/sidebarStore";
import Genres from "./Genres";

const Sidebar = () => {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const sidebarHandler = useSidebarStore((state) => state.toggleSidebar);
  const pathname = usePathname();

  useEffect(() => {
    if (isSidebarOpen) sidebarHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const list = [
    { name: "Home", link: "/home" },
    { name: "Most Popular", link: "/explore/bypopularity" },
    { name: "Top Airing", link: "/explore/airing" },
    { name: "Most Favorite", link: "/explore/favorite" },
    { name: "Home Comic", link: "/comic" },
    { name: "Leaderboard", link: "/leaderboard" },
  ];

  return (
    <div
      className={`sidebar transition-all fixed overflow-scroll h-full z-[100] inset-0 w-64 md:w-80  bg-[rgba(255,255,255,.1);] ${
        isSidebarOpen ? "translate-x-0" : "translate-x-[-100%]"
      }`}
    >
      <button
        className="w-full pt-4 pl-2 flex items-center gap-2 hover:text-primary text-base md:text-xl"
        onClick={sidebarHandler}
      >
        <FaAngleLeft />
        <span>close menu</span>
      </button>
      <ul className="py-4">
        {list.map((item) => (
          <li
            key={item.link}
            onClick={sidebarHandler}
            className=" py-4 pl-4 hover:text-primary  text-base md:text-lg border-b border-[rgba(255,255,255,.05)] w-full"
          >
            <Link href={item.link}>{item.name}</Link>
          </li>
        ))}
        <li className=" py-4 pl-2 text-base md:text-lg w-full">genres</li>
        <Genres className="w-1/2 my-2 pl-2 hover:opacity-[.7]" />
      </ul>
    </div>
  );
};

export default Sidebar;
