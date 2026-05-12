import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
