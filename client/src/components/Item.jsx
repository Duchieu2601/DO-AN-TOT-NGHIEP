import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../store/reducers/wishlistSlice";
import React, { memo, useState } from "react";
import icons from "../ultils/icons";
import { useNavigate, Link } from "react-router-dom";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";
import { path } from "../ultils/constant";
import NoImage from "../../src/assets/no-image.svg";
const { GrStar, RiHeartFill, RiHeartLine, CiCamera } = icons;

const Item = ({
  images,
  title,
  attributes,
  star,
  description,
  user,
  overview,
  id,
}) => {
  const [isHoverHeart, setisHoverHeart] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { ids } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const isWishlisted = ids?.includes(id);

  const handleStar = (star) => {
    let stars = [];
    for (let i = 1; i <= +star; i++)
      stars.push(
        <GrStar
          key={i}
          className="star-item inline-block mr-0.5 align-middle mb-0.5 w-[13px] h-[13px]"
          size={13}
          color="#ffd43b"
        />,
      );
    return stars;
  };

  // ====== LOGIC XỬ LÝ MẢNG ẢNH ======
  let rawDataForTypes = [];

  try {
    const dataToParse =
      images && typeof images === "object" ? images.image || images : images;

    rawDataForTypes =
      typeof dataToParse === "string"
        ? JSON.parse(dataToParse)
        : dataToParse || [];
  } catch (e) {
    rawDataForTypes = [];
  }

  const checkIsVideo = (index) => {
    return sortedMedia[index]?.type === "video";
  };
  const ROOM_PLACEHOLDER = NoImage;
  const USER_PLACEHOLDER =
    "https://as1.ftcdn.net/v2/jpg/05/16/27/58/1000_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";
  const TIKTOK_PLACEHOLDER = "https://placehold.co/600x450?text=TikTok+Video";
  const getVideoThumbnail = () => {
    const firstImage = sortedMedia.find((media) => media?.type === "image");

    return firstImage?.src || ROOM_PLACEHOLDER;
  };
  const sortedMedia = [...rawDataForTypes].sort((a, b) => {
    if (a.type === "video" && b.type !== "video") return -1;
    if (a.type !== "video" && b.type === "video") return 1;
    return 0;
  });
  const imageList = sortedMedia.filter((item) => item?.type === "image");
  const mediaList = sortedMedia.map((item) => item.src);
  const galleryImages = sortedMedia.map((item) => item.src).filter(Boolean);

  const imageCount = sortedMedia.length;
  const mediaCount = imageList.length;

  const ImageItem = ({ item, alt }) => {
    const [imgSrc, setImgSrc] = useState(item?.src || ROOM_PLACEHOLDER);

    if (item?.type === "video") {
      return (
        <img
          src={getVideoThumbnail()}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = ROOM_PLACEHOLDER;
          }}
        />
      );
    }

    return (
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={() => setImgSrc(ROOM_PLACEHOLDER)}
      />
    );
  };
  const detailPath = `${path.DETAIL}${formatVietnameseToString(title?.replaceAll("/", ""))}/${id}`;

  // Hàm render nút Play nếu ảnh đầu tiên hoặc bài viết có chứa video
  const renderPlayButton = (index = 0) => {
    if (checkIsVideo(index)) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/40 text-white rounded-full p-2 shadow-md flex items-center justify-center pl-2.5">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      );
    }
    return null;
  };

  // Hàm render Badge thông báo tổng số lượng ảnh ở góc dưới bên trái
  const renderImageCountBadge = () => (
    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-1.5 py-[2px] rounded-[3px] text-[10.5px] flex items-center gap-1 font-medium z-10">
      <CiCamera className="w-3.5 h-3.5" size={13} />
      <span>{mediaCount}</span>
    </div>
  );

  return (
    <div className="w-full max-w-[760px] mx-auto bg-white rounded-lg border border-gray-200 font-sans p-4 flex flex-col gap-3 my-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* ====== KHU VỰC KHUNG LƯỚI ẢNH PHÍA TRÊN ====== */}
      <div className="w-full aspect-[4/3] sm:aspect-[24/10] relative flex-shrink-0 overflow-hidden rounded-md bg-white">
        <Link to={detailPath} className="block h-full w-full group">
          {/* TRƯỜNG HỢP 0: Chưa có ảnh */}
          {imageCount === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-2">
              <CiCamera className="w-7 h-7 text-gray-300" size={28} />
              <span className="text-[12.5px] text-gray-400">
                Hình ảnh đang được cập nhật
              </span>
            </div>
          )}

          {/* TRƯỜNG HỢP 1: Có đúng 1 ảnh -> Hiển thị full khung hình */}
          {imageCount === 1 && (
            <div className="relative h-full w-full overflow-hidden">
              <ImageItem item={sortedMedia[0]} index={0} alt="Main" />
              {renderPlayButton(0)}
              {renderImageCountBadge()}
            </div>
          )}

          {/* TRƯỜNG HỢP 2: Có 2 ảnh -> Chia đôi màn hình (Mỗi bên chiếm 50% chiều rộng) */}
          {imageCount === 2 && (
            <div className="flex gap-[4px] h-full w-full">
              <div className="relative overflow-hidden flex-1 rounded-[3px]">
                <ImageItem item={sortedMedia[0]} index={0} alt="Pic 1" />
                {renderPlayButton(0)}
                {renderImageCountBadge()}
              </div>
              <div className="relative overflow-hidden flex-1 rounded-[3px]">
                <ImageItem item={sortedMedia[1]} index={1} alt="Pic 2" />
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 3: Có 3 ảnh -> 1 cái lớn bên trái (60%), 2 cái nhỏ xếp dọc bên phải (40%) */}
          {imageCount === 3 && (
            <div className="flex gap-[4px] h-full w-full">
              {/* Bên trái: Ảnh chính chiếm tỷ lệ lớn */}
              <div className="relative overflow-hidden h-full flex-[60] rounded-[3px]">
                <ImageItem item={sortedMedia[0]} index={0} alt="Main" />
                {renderPlayButton(0)}
                {renderImageCountBadge()}
              </div>
              {/* Bên phải: 2 ảnh phụ nằm dọc song song */}
              <div className="h-full flex-[40] flex flex-col gap-[4px]">
                <div className="flex-1 overflow-hidden rounded-[3px]">
                  <ImageItem item={sortedMedia[1]} index={1} alt="Sub 1" />
                </div>
                <div className="flex-1 overflow-hidden rounded-[3px]">
                  <ImageItem item={sortedMedia[2]} index={2} alt="Sub 2" />
                </div>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 4: Có từ 4 ảnh trở lên -> Sử dụng Grid để ép các ô bằng nhau tuyệt đối */}
          {imageCount >= 4 && (
            <div className="flex gap-[4px] h-full w-full bg-white">
              {/* Bên trái: Ảnh lớn chính */}
              <div className="relative overflow-hidden h-full flex-[58] rounded-[3px]">
                <ImageItem item={sortedMedia[0]} index={0} alt="Main" />
                {renderPlayButton(0)}
                {renderImageCountBadge()}
              </div>

              {/* Bên phải: Chia làm 2 hàng bằng nhau tuyệt đối bằng grid-rows-2 */}
              <div className="h-full flex-[42] grid grid-rows-2 gap-[4px]">
                {/* Hàng trên: Ảnh thứ 2 (Chiếm trọn hàng 1) */}
                <div className="overflow-hidden rounded-[3px] w-full h-full">
                  <ImageItem
                    item={sortedMedia[1] || sortedMedia[0]}
                    index={1}
                    alt="Sub 1"
                  />
                </div>

                {/* Hàng dưới: Chia đôi thành 2 ô ảnh nhỏ bằng grid-cols-2 */}
                <div className="grid grid-cols-2 gap-[4px] w-full h-full">
                  <div className="overflow-hidden rounded-[3px] w-full h-full">
                    <ImageItem
                      item={sortedMedia[2] || sortedMedia[0]}
                      index={2}
                      alt="Sub 2"
                    />
                  </div>
                  <div className="overflow-hidden relative rounded-[3px] w-full h-full">
                    <ImageItem
                      item={sortedMedia[3] || sortedMedia[0]}
                      index={3}
                      alt="Sub 3"
                    />
                    {imageCount > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-white text-[11px] font-bold">
                          +{imageCount - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* ====== KHU VỰC KHỐI NỘI DUNG PHÍA DƯỚI ====== */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pt-1">
        <div>
          {/* Tiêu đề */}
          <div className="mb-1">
            <Link to={detailPath} className="block group/title">
              <h3 className="text-[#e03c3c] font-bold text-[14.5px] uppercase line-clamp-2 leading-[20px] group-hover/title:text-blue-600 transition-colors">
                {star > 0 && (
                  <span className="inline-block mr-1">{handleStar(+star)}</span>
                )}
                {title}
              </h3>
            </Link>
          </div>

          {/* Thông số chính */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5 text-[13.5px]">
            <span className="text-[#16a34a] font-bold text-[14.5px]">
              {attributes?.price || "Thỏa thuận"}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-700 font-semibold">
              {attributes?.acreage}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-normal truncate max-w-[200px] sm:max-w-[350px]">
              {overview?.address &&
                `${overview?.address.split(",")[overview.address.split(",").length - 2] || ""}, ${overview?.address.split(",")[overview.address.split(",").length - 1] || ""}`}
            </span>
          </div>

          {/* Mô tả ngắn */}
          <p className="text-[#666666] text-[12.5px] line-clamp-2 leading-[18px] mb-2.5">
            {description || "Chưa có mô tả chi tiết cho bài đăng này."}
          </p>
        </div>

        {/* ====== PHẦN CHÂN TRANG (FOOTER) ====== */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Người đăng bài */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={user?.avatar || USER_PLACEHOLDER}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = USER_PLACEHOLDER;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-700 truncate max-w-[120px] leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Hôm nay</p>
            </div>
          </div>

          {/* Nút Gọi & Yêu thích */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user?.phone && (
              <a
                href={`tel:${user.phone}`}
                className="bg-[#16a34a] text-white px-2.5 py-1.5 rounded-[4px] font-bold text-[12px] hover:bg-green-700 transition-colors shadow-sm"
              >
                {user.phone}
              </a>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoggedIn) {
                  alert("Vui lòng đăng nhập để lưu tin");
                  return;
                }
                dispatch(toggleWishlist(id));
              }}
              className="p-1 focus:outline-none flex items-center justify-center transition-transform active:scale-90"
            >
              {isWishlisted ? (
                <RiHeartFill className="w-5 h-5" size={20} color="#ff3a3a" />
              ) : (
                <RiHeartLine className="w-5 h-5" size={20} color="#ff3a3a" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Item);
