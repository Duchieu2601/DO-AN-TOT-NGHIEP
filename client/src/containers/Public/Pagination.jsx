import React, { useEffect, useState } from "react";
import { PageNumber } from "../../components";
import { useSelector } from "react-redux";
import icons from "../../ultils/icons";
import { useSearchParams } from "react-router-dom";

const { GrLinkNext } = icons;
const LIMIT = parseInt(import.meta.env.VITE_LIMIT_POSTS) || 10;

const Pagination = () => {
  const { count } = useSelector((state) => state.post);
  const [arrPage, setArrPage] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHideEnd, setIsHideEnd] = useState(false);
  const [isHideStart, setIsHideStart] = useState(false);
  const [searchParams] = useSearchParams();

  const maxPage = Math.ceil(count / LIMIT);

  useEffect(() => {
    let page = searchParams.get("page");
    page && +page !== currentPage && setCurrentPage(+page);
    !page && setCurrentPage(1);
  }, [searchParams, currentPage]);

  useEffect(() => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, maxPage);

    const hideStart = currentPage <= 3;
    const hideEnd = currentPage >= maxPage - 2;

    setIsHideStart(hideStart);
    setIsHideEnd(hideEnd);

    let actualStart = hideStart ? start : start + 1;
    let actualEnd = hideEnd ? end : end - 1;

    let temp = [];
    for (let i = actualStart; i <= actualEnd; i++) {
      if (i > 0 && i <= maxPage) temp.push(i);
    }
    setArrPage(temp);
  }, [currentPage, maxPage]);

  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {/* Nút trang đầu */}
      {!isHideStart && <PageNumber setCurrentPage={setCurrentPage} text={1} />}
      {!isHideStart && currentPage !== 4 && <PageNumber text={"..."} />}

      {/* Các nút trang ở giữa (Không bao giờ lo trùng số) */}
      {arrPage.length > 0 &&
        arrPage.map((item) => (
          <PageNumber
            key={item}
            text={item}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        ))}

      {/* Nút trang cuối */}
      {!isHideEnd && currentPage !== maxPage - 3 && <PageNumber text={"..."} />}
      {!isHideEnd && maxPage > 0 && (
        <PageNumber
          icon={<GrLinkNext />}
          setCurrentPage={setCurrentPage}
          text={maxPage}
        />
      )}
    </div>
  );
};

export default Pagination;
