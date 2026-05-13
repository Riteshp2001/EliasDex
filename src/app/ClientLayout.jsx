// src/app/ClientLayout.jsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ScrollToTop from "@/utils/ScrollToTop";
import useSidebarStore from "@/store/sidebarStore";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  return (
    <>
      {!isRoot && <Sidebar />}

      {/* Overlay Blur */}
      <div onClick={toggleSidebar} className={`opacityBg ${isSidebarOpen ? "active" : ""}`} />

      <main
        className={`
          opacityWrapper
          ${isSidebarOpen ? "layout-blur" : ""}
        `}
      >
        {!isRoot && <Header />}
        <ScrollToTop />
        {children}
      </main>
    </>
  );
}
