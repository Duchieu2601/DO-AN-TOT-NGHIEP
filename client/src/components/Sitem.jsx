import React, { memo, useState } from "react";
import moment from "moment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
dayjs.extend(relativeTime);
dayjs.locale("vi");
import { Link } from "react-router-dom";
import { path } from "../ultils/constant";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";

const Sitem = ({ id, title, price, image, createdAt }) => {
  const ROOM_PLACEHOLDER =
    "https://placehold.co/150x150?text=Hinh+Anh+Phong+Trong";

  // ====== LOGIC XỬ LÝ MẢNG ẢNH ĐỒNG BỘ VỚI ITEM.JSX ======
  const getFirstCleanImage = () => {
    if (!image) return ROOM_PLACEHOLDER;

    let rawImages = [];
    try {
      rawImages = typeof image === "string" ? JSON.parse(image) : image;
    } catch (e) {
      rawImages = [image];
    }

    if (!Array.isArray(rawImages)) {
      rawImages = [rawImages];
    }

    // Lọc bỏ video, chỉ lấy ảnh sạch
    const validImagesOnly = rawImages.filter((item) => {
      if (!item) return false;

      if (typeof item === "object") {
        if (item.type === "video") return false;
        if (
          item.src &&
          (item.src.includes("youtube.com") || item.src.includes(".mp4"))
        )
          return false;
        return true;
      }

      if (typeof item === "string") {
        const lowerStr = item.toLowerCase();
        if (
          lowerStr.includes("youtube.com") ||
          lowerStr.includes("youtu.be") ||
          lowerStr.includes(".mp4") ||
          lowerStr.includes("watch")
        ) {
          return false;
        }
        return true;
      }

      return false;
    });

    if (validImagesOnly.length > 0) {
      const firstItem = validImagesOnly[0];
      return typeof firstItem === "object" ? firstItem.src : firstItem;
    }

    return ROOM_PLACEHOLDER;
  };

  const cleanImageSrc = getFirstCleanImage();

  // ====== COMPONENT CON XỬ LÝ LỖI ẢNH ======
  const ImageItem = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(src || ROOM_PLACEHOLDER);

    return (
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={() => setImgSrc(ROOM_PLACEHOLDER)}
      />
    );
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    return dayjs(createdAt).fromNow();
  };

  const detailPath = `${path.DETAIL}${formatVietnameseToString(title?.replaceAll("/", ""))}/${id}`;

  return (
    <div className="w-full flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-none hover:bg-gray-50/50 px-1 rounded-md transition-colors">
      {/* Khung chứa ảnh */}
      <Link
        to={detailPath}
        className="w-[70px] h-[70px] flex-none overflow-hidden rounded-md block group bg-gray-100 border border-gray-200 shadow-sm"
      >
        <ImageItem src={cleanImageSrc} alt={title} />
      </Link>

      {/* Khối nội dung bên phải */}
      <div className="w-full flex-auto flex flex-col justify-between gap-1 min-w-0">
        <Link to={detailPath} className="group/title">
          <h4 className="text-gray-800 font-medium text-[13.5px] line-clamp-2 leading-[18px] group-hover/title:text-blue-600 transition-colors">
            {title}
          </h4>
        </Link>

        <div className="flex items-center justify-between w-full mt-0.5">
          <span className="text-[13px] font-bold text-[#16a34a]">
            {price || "Thỏa thuận"}
          </span>
          <span className="text-[11px] text-gray-400 font-light">
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(Sitem);
