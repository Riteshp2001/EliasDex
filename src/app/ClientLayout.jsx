// src/app/ClientLayout.jsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ScrollToTop from "@/utils/ScrollToTop";
import useSidebarStore from "@/store/sidebarStore";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  // Tambahkan di ClientLayout atau component tertentu
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
