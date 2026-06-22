import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../../store/reducers/wishlistSlice";
import * as actions from "../../store/actions";
import { RelatedPost, MapAddress, CommentSection } from "../../components";
import icons from "../../ultils/icons";
import NoImage from "../../assets/no-image.svg";

const { HiOutlineLocationMarker, BsChevronRight } = icons;
const ROOM_PLACEHOLDER = NoImage;
const renderMedia = (item) => {
  if (!item) return null;

  if (item.type === "image") {
    return (
      <img
        src={item.src || ROOM_PLACEHOLDER}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = ROOM_PLACEHOLDER;
        }}
      />
    );
  }

  const src = item.src || "";

  // Youtube
  if (src.includes("youtube.com") || src.includes("youtu.be")) {
    let videoId = "";

    try {
      if (src.includes("youtu.be")) {
        videoId = src.split("youtu.be/")[1]?.split("?")[0];
      } else {
        videoId = new URL(src).searchParams.get("v");
      }
    } catch {}

    if (!videoId) {
      return (
        <img
          src={ROOM_PLACEHOLDER}
          alt=""
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="youtube"
        allowFullScreen
        className="w-full h-full"
      />
    );
  }

  // TikTok
  if (src.includes("tiktok.com")) {
    return (
      <iframe
        src={src}
        title="tiktok"
        className="w-full h-full"
        allowFullScreen
      />
    );
  }

  // Video file
  const isVideo =
    item.type === "video" || src.match(/\.(mp4|mov|webm|m4v)(\?.*)?$/i);

  if (isVideo) {
    return (
      <video controls className="w-full h-full" poster={ROOM_PLACEHOLDER}>
        <source src={src} />
      </video>
    );
  }

  return (
    <img src={ROOM_PLACEHOLDER} alt="" className="w-full h-full object-cover" />
  );
};
const parseImages = (raw) => {
  try {
    const d = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (Array.isArray(d)) {
      return d.map((item) => {
        if (typeof item === "string") {
          return {
            type: "image",
            src: item,
          };
        }

        return item;
      });
    }
  } catch (_) {}

  return [];
};

const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  const days = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const pad = (n) => String(n).padStart(2, "0");
  return `${days[d.getDay()]}, ${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const AMENITIES = [
  { key: "hasFurniture", icon: "🛋️", label: "Đầy đủ nội thất" },
  { key: "hasMezzanine", icon: "🪜", label: "Có gác" },
  { key: "hasKitchen", icon: "🍳", label: "Có kệ bếp" },
  { key: "hasAirConditioner", icon: "❄️", label: "Có máy lạnh" },
  { key: "hasWashingMachine", icon: "🫧", label: "Có máy giặt" },
  { key: "hasFridge", icon: "🧊", label: "Có tủ lạnh" },
  { key: "hasElevator", icon: "🛗", label: "Có thang máy" },
  { key: "isNoOwner", icon: "🔑", label: "Không chung chủ" },
  { key: "isFreeTime", icon: "🕐", label: "Giờ giấc tự do" },
  { key: "hasSecurity", icon: "👮", label: "Có bảo vệ 24/24" },
  { key: "hasParking", icon: "🅿️", label: "Có hầm để xe" },
];

/* ── Gallery ── */
const Gallery = ({ images, address }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState("image");
  useEffect(() => {
    setActiveIdx(0);
  }, [images.length]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Tab bar */}
      <div className="flex bg-white border-b border-gray-200 text-[13px] font-medium">
        {[
          { key: "image", label: "Hình ảnh" },
          { key: "map", label: "Bản đồ" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 border-b-2 transition-colors ${
              tab === t.key
                ? "border-orange-500 text-orange-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "image" && images.length > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-[11px] px-1.5 py-0.5 rounded-full">
                {images.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "image" &&
        (images.length === 0 ? (
          <div className="h-72 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Không có ảnh
          </div>
        ) : (
          <>
            {/* ── Ảnh chính: nền đen, ảnh căn giữa, không bị stretch ── */}
            <div
              className="relative bg-black flex items-center justify-center"
              style={{ height: 400 }}
            >
              <div className="h-full flex items-center justify-center">
                {images[activeIdx]?.type === "image" ? (
                  <img
                    src={images[activeIdx]?.src || ROOM_PLACEHOLDER}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ROOM_PLACEHOLDER;
                    }}
                  />
                ) : (
                  renderMedia(images[activeIdx])
                )}
              </div>

              {/* Nút prev/next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveIdx(
                        (p) => (p - 1 + images.length) % images.length,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full text-2xl flex items-center justify-center transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveIdx((p) => (p + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full text-2xl flex items-center justify-center transition"
                  >
                    ›
                  </button>
                </>
              )}

              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                {activeIdx + 1}/{images.length}
              </span>
            </div>

            {/* ── Thumbnail: wrap 2 hàng, căn giữa ── */}
            <div className="bg-gray-900 p-2">
              <div className="flex flex-wrap justify-center gap-1.5">
                {images.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`h-16 w-[72px] rounded overflow-hidden cursor-pointer flex-shrink-0 transition border-2 ${
                      i === activeIdx
                        ? "border-orange-500"
                        : "border-transparent hover:border-gray-400"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.src || ROOM_PLACEHOLDER}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ROOM_PLACEHOLDER;
                        }}
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ))}

      {tab === "map" && (
        <div className="w-full">
          <MapAddress address={address} height="400px" />
        </div>
      )}
    </div>
  );
};

/* ══════════════════ MAIN ══════════════════ */
const DetailPost = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost } = useSelector((s) => s.post);
  const { ids } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const isWishlisted = ids?.includes(currentPost?.id);

  useEffect(() => {
    if (postId) dispatch(actions.getPostById(postId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [postId, dispatch]);

  if (!currentPost)
    return (
      <div className="w-full flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải bài đăng...</span>
        </div>
      </div>
    );

  const images = parseImages(currentPost?.images?.image)
    .filter(Boolean)
    .sort((a, b) => {
      if (a?.type === "video" && b?.type !== "video") return -1;
      if (a?.type !== "video" && b?.type === "video") return 1;
      return 0;
    });
  const attr = currentPost?.attributes || {};
  const overview = currentPost?.overview || {};
  const user = currentPost?.user || {};
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-orange-500 transition">
          {currentPost?.category?.value || "Danh mục"}
        </Link>
        <BsChevronRight size={9} />
        <span>{overview?.city || "Toàn quốc"}</span>
        {overview?.district && (
          <>
            <BsChevronRight size={9} />
            <span>{overview.district}</span>
          </>
        )}
        <BsChevronRight size={9} />
        <span className="text-gray-700 font-medium line-clamp-1 max-w-xs">
          {currentPost.title}
        </span>
      </nav>

      <div className="flex gap-5 flex-col lg:flex-row items-start">
        {/* ═════════ LEFT CONTENT ═════════ */}
        <div className="flex-1 min-w-0 w-full">
          {/* Gallery */}
          <Gallery images={images} address={overview?.address} />

          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-md p-5 mt-4 shadow-sm">
            {(currentPost?.label?.value || currentPost?.star > 0) && (
              <div className="flex items-center gap-2 mb-3">
                {currentPost?.star > 0 && (
                  <span className="text-yellow-500 text-lg">
                    {"★".repeat(currentPost.star)}
                  </span>
                )}

                {currentPost?.label?.value && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {currentPost.label.value}
                  </span>
                )}
              </div>
            )}

            <h1 className="text-2xl md:text-[28px] font-bold text-red-500 mb-4 leading-tight">
              {currentPost.title}
            </h1>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 text-sm border-b pb-4">
              <span className="text-green-600 font-bold text-2xl md:text-[30px] leading-none">
                {attr?.price}
              </span>

              <span className="text-gray-700 font-medium">{attr?.acreage}</span>

              <span className="text-gray-600">
                {[overview?.district, overview?.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>

              <span className="ml-auto text-gray-400 text-xs">
                Cập nhật:{" "}
                {attr?.published ? formatDate(attr.published) : "vừa xong"}
              </span>
            </div>

            <div className="mt-4">
              <table className="w-full text-sm text-gray-700">
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 w-32 md:w-40 text-gray-400">
                      Quận huyện:
                    </td>
                    <td className="font-medium">{overview?.district}</td>
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400">Tỉnh thành:</td>
                    <td className="font-medium">{overview?.city}</td>
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400">Địa chỉ:</td>
                    <td className="font-medium">{overview?.address}</td>
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400">Mã tin:</td>
                    <td className="font-medium">{overview?.type}</td>
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400">Ngày đăng:</td>
                    <td className="font-medium">
                      {overview?.created ? formatDate(overview.created) : ""}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 text-gray-400">Ngày hết hạn:</td>
                    <td className="font-medium">
                      {overview?.expire ? formatDate(overview.expire) : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mô tả */}
          <div
            id="description"
            className="bg-white border border-gray-200 rounded-md p-5 mt-4 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Thông tin mô tả
            </h2>
            <div className="flex flex-col gap-3 text-justify">
              {currentPost?.description &&
                (() => {
                  try {
                    const parsedData = JSON.parse(currentPost.description);
                    if (Array.isArray(parsedData)) {
                      return parsedData.map((item, index) => (
                        <p
                          key={index}
                          className="leading-7 text-gray-600 text-sm md:text-base"
                        >
                          {item}
                        </p>
                      ));
                    }
                    if (typeof parsedData === "string") {
                      return (
                        <p className="leading-7 text-gray-600 text-sm md:text-base">
                          {parsedData}
                        </p>
                      );
                    }
                  } catch {}

                  const cleanDescription = currentPost.description.replace(
                    /^"|"$/g,
                    "",
                  );
                  return (
                    <p className="leading-7 text-gray-600 text-sm md:text-base">
                      {cleanDescription}
                    </p>
                  );
                })()}
            </div>
          </div>

          {/* Nổi bật */}
          <div
            id="features"
            className="bg-white border border-gray-200 rounded-md p-5 mt-4 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Đặc điểm tin đăng
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-sm">
              {AMENITIES.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <span
                    className={`text-[15px] ${attr[item.key] ? "opacity-100" : "opacity-30 filter grayscale"}`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={
                      attr[item.key]
                        ? "text-gray-700 font-medium"
                        : "text-gray-300 line-through"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div
            id="location"
            className="bg-white border border-gray-200 rounded-md p-5 mt-4 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Vị trí & bản đồ
            </h2>
            <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
              <HiOutlineLocationMarker
                className="text-orange-500 flex-shrink-0"
                size={18}
              />
              <span>{overview?.address}</span>
            </div>
            <div className="w-full overflow-hidden rounded-lg border border-gray-200">
              <MapAddress address={overview?.address} height="400px" />
            </div>
          </div>

          {/* ─── OPTIMIZED: THÔNG TIN LIÊN HỆ CHÍNH ─── */}
          <div
            id="contact"
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-6 mt-4 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👤</span> Thông tin liên hệ chính
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-4 rounded-xl border border-orange-100/70 shadow-inner-sm">
              {/* Trái: Avatar & Tên */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                  <img
                    src={
                      user?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={user?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                  />
                  <span className="absolute bottom-1 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                    Chủ nhà
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 leading-tight mt-0.5">
                    {user?.name || "Chủ tài khoản"}
                  </h3>
                  <p className="text-green-600 text-xs flex items-center gap-1 mt-1 font-medium">
                    <span>●</span> Đang hoạt động trực tuyến
                  </p>
                </div>
              </div>

              {/* Phải: Nhóm nút hành động */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-stretch sm:justify-end">
                <a
                  href={`tel:${user?.phone}`}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-6 h-12 rounded-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <span className="text-lg">📞</span> Gọi{" "}
                  {user?.phone || "Đang cập nhật"}
                </a>

                <a
                  href={`https://zalo.me/${user?.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  <span className="bg-white text-blue-600 text-[11px] font-black px-1 rounded-sm">
                    Zalo
                  </span>{" "}
                  Nhắn Zalo ngay
                </a>
              </div>
            </div>
          </div>
          <CommentSection postId={currentPost?.id} />
        </div>

        {/* ═════════ RIGHT SIDEBAR ═════════ */}
        <div className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-4">
          <div className="flex flex-col gap-4">
            {/* Contact Card Sidebar */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-6 text-center bg-gradient-to-b from-gray-50/50 to-white border-b">
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={
                      user?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt=""
                    className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-gray-800 line-clamp-1">
                  {user?.name || "Chủ nhà"}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Thành viên Ban quản trị
                </p>
              </div>

              <div className="p-4 flex flex-col gap-2.5">
                <a
                  href={`tel:${user?.phone}`}
                  className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white font-bold text-base transition gap-2 shadow-sm"
                >
                  <span>📞</span> {user?.phone}
                </a>

                <a
                  href={`https://zalo.me/${user?.zalo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center justify-center font-bold text-sm transition"
                >
                  Nhắn Zalo chủ nhà
                </a>
              </div>

              <div className="border-t bg-gray-50/50 px-4 py-2.5">
                <div className="grid grid-cols-3 text-xs text-center font-medium text-gray-500">
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        alert("Vui lòng đăng nhập để lưu tin");
                        return;
                      }
                      dispatch(toggleWishlist(currentPost?.id));
                    }}
                    className="hover:text-orange-500 py-1 transition flex items-center justify-center gap-1"
                  >
                    {isWishlisted ? "❤️ Đã lưu" : "🤍 Lưu tin"}
                  </button>
                  <button className="hover:text-orange-500 py-1 transition flex items-center justify-center gap-1">
                    🔗 Chia sẻ
                  </button>
                  <button className="hover:text-red-500 py-1 transition flex items-center justify-center gap-1">
                    🚩 Báo xấu
                  </button>
                </div>
              </div>
            </div>
            {/* Tin mới */}
            <RelatedPost />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPost;
