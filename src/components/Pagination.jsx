import React, { useMemo } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

// 1. Pindahkan helper ke luar komponen agar referensinya stabil (Fix ESLint)
const range = (start, end) => {
  return [...Array(end - start + 1)].map((_, i) => start + i);
};

const getPage = (page, total) => {
  if (total <= 5) return range(1, total);

  const start = Math.max(1, page - 2);
  const end = Math.min(total, page + 2);

  return range(start, end);
};

const Pagination = ({ currentPage, totalPages, onChange }) => {
  // console.log(currentPage, totalPages); // Debugging

  // 2. Sekarang getPage tidak perlu masuk dependency array
  const pageNav = useMemo(
    () => getPage(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const showFirst = currentPage > 1;
  const showPrev = currentPage > 1;
  const showNext = totalPages - currentPage > 1;
  const showEnd = totalPages - currentPage > 1;

  const changePage = (num) => {
    onChange(num);
  };

  const liClass =
    "bg-lightbg text-sm sm:text-base hover:text-primary rounded-full size-10 sm:size-11 flex justify-center items-center cursor-pointer transition-colors";

  return (
    <nav aria-label="Pagination">
      <ul className="flex justify-center items-center gap-2 my-5">
        {showFirst && (
          <li className={liClass} title="First Page" onClick={() => changePage(1)}>
            <FaAngleDoubleLeft />
          </li>
        )}

        {showPrev && (
          <li
            className={liClass}
            title={`Page ${currentPage - 1}`}
            onClick={() => changePage(currentPage - 1)}
          >
            <FaAngleLeft />
          </li>
        )}

        {pageNav.map((p) => (
          <li
            key={p}
            title={`Page ${p}`}
            className={`${
              currentPage === p ? "bg-primary text-black font-bold" : ""
            } ${liClass}`}
            onClick={() => changePage(p)}
          >
            {/* Pakai button di dalam li untuk aksesibilitas yang lebih baik */}
            <button type="button">{p}</button>
          </li>
        ))}

        {showNext && (
          <li
            className={liClass}
            title={`Page ${currentPage + 1}`}
            onClick={() => changePage(currentPage + 1)}
          >
            <FaAngleRight />
          </li>
        )}

        {showEnd && (
          <li
            className={liClass}
            title={`Page ${totalPages}`}
            onClick={() => changePage(totalPages)}
          >
            <FaAngleDoubleRight />
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;