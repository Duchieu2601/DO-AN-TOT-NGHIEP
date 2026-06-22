import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdSearch,
  MdDelete,
  MdVisibilityOff,
  MdVisibility,
  MdRefresh,
} from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { useSelector } from "react-redux";

const BASE = import.meta.env.VITE_REACT_APP_SERVER_URL || "";

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "visible", label: "Đang hiển thị" },
  { key: "hidden", label: "Đã ẩn" },
];

const AdminManagePosts = () => {
  const { token } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState({ text: "", type: "info" });
  const limit = 10;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPosts = async (p = 1, q = "", s = "all") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/admin/posts`, {
        headers,
        params: {
          page: p,
          limit,
          search: q,
          status: s === "all" ? undefined : s,
        },
      });
      if (res.data?.err === 0) {
        setPosts(res.data.rows || []);
        setTotal(res.data.count || 0);
        setTotalPages(Math.ceil((res.data.count || 0) / limit) || 1);
      }
    } catch (e) {
      showMsg(
        "Không thể tải bài đăng: " + (e.response?.data?.msg || e.message),
        "error",
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(page, search, status);
  }, [page, status]);

  const showMsg = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "info" }), 3000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, search, status);
  };

  const handleDelete = async (id, title) => {
    if (
      !window.confirm(`Xóa bài đăng "${title}"? Thao tác không thể hoàn tác!`)
    )
      return;
    try {
      await axios.delete(`${BASE}/api/admin/posts/${id}`, { headers });
      showMsg("Đã xóa bài đăng.", "success");
      fetchPosts(page, search, status);
    } catch (e) {
      showMsg("Xóa thất bại: " + (e.response?.data?.msg || e.message), "error");
    }
  };

  const handleToggleHide = async (id, isHidden, title) => {
    try {
      await axios.patch(
        `${BASE}/api/admin/posts/${id}/hide`,
        { hidden: !isHidden },
        { headers },
      );
      showMsg(
        isHidden ? `Đã hiện bài: ${title}` : `Đã ẩn bài: ${title}`,
        "success",
      );
      fetchPosts(page, search, status);
    } catch (e) {
      showMsg(
        "Thao tác thất bại: " + (e.response?.data?.msg || e.message),
        "error",
      );
    }
  };

  const msgStyle = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  // Format giá từ attributes.price (chuỗi VD: "3 triệu/tháng") hoặc priceNumber
  const formatPrice = (post) => {
    if (post.attributes?.price) return post.attributes.price;
    if (post.priceNumber) return `${post.priceNumber} triệu/tháng`;
    return "—";
  };

  // Format ngày đăng từ overview.created
  const formatDate = (post) => {
    if (post.overview?.created) return post.overview.created;
    if (post.createdAt)
      return new Date(post.createdAt).toLocaleDateString("vi-VN");
    return "—";
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý bài đăng</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng cộng{" "}
            <span className="font-semibold text-gray-600">{total}</span> bài
            đăng
          </p>
        </div>
        <button
          onClick={() => fetchPosts(page, search, status)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <MdRefresh size={16} /> Làm mới
        </button>
      </div>

      {/* Thông báo */}
      {msg.text && (
        <div
          className={`text-sm px-4 py-2 rounded-lg border flex items-center justify-between ${msgStyle[msg.type]}`}
        >
          {msg.text}
          <button
            onClick={() => setMsg({ text: "" })}
            className="ml-4 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs lọc */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === tab.key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tìm kiếm */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bài đăng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium"
        >
          Tìm kiếm
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
              fetchPosts(1, "", status);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
          >
            Xóa bộ lọc
          </button>
        )}
      </form>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-400">Đang tải...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Không có bài đăng nào.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Giá
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Diện tích
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Ngày đăng
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, idx) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {/* STT */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  {/* Tiêu đề */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <div
                      className="font-medium text-gray-800 truncate"
                      title={post.title}
                    >
                      {post.title || "(không có tiêu đề)"}
                    </div>
                    {post.overview?.type && (
                      <div className="text-xs text-indigo-500 truncate">
                        {post.overview.type}
                      </div>
                    )}
                  </td>
                  {/* Tác giả */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-700">
                      {post.user?.name || "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {post.user?.phone || ""}
                    </div>
                  </td>
                  {/* Giá */}
                  <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">
                    {formatPrice(post)}
                  </td>
                  {/* Diện tích */}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {post.attributes?.acreage ||
                      (post.areaNumber ? `${post.areaNumber}m²` : "—")}
                  </td>
                  {/* Ngày đăng */}
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(post)}
                  </td>
                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    {post.hidden ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        🙈 Đã ẩn
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ Hiển thị
                      </span>
                    )}
                  </td>
                  {/* Hành động */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Xem chi tiết"
                        onClick={() =>
                          alert(
                            `📋 Chi tiết bài đăng\n\nTiêu đề: ${post.title}\nTác giả: ${post.user?.name} (${post.user?.phone})\nGiá: ${formatPrice(post)}\nDiện tích: ${post.attributes?.acreage || post.areaNumber + "m²"}\nNgày đăng: ${formatDate(post)}\nHết hạn: ${post.overview?.expire || "—"}\nTrạng thái: ${post.hidden ? "Đã ẩn" : "Hiển thị"}`,
                          )
                        }
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                      >
                        <FiEye size={14} />
                      </button>
                      <button
                        title={post.hidden ? "Hiện bài đăng" : "Ẩn bài đăng"}
                        onClick={() =>
                          handleToggleHide(post.id, post.hidden, post.title)
                        }
                        className={`p-1.5 rounded-lg border hover:opacity-80 ${
                          post.hidden
                            ? "border-blue-200 text-blue-500 hover:bg-blue-50"
                            : "border-orange-200 text-orange-500 hover:bg-orange-50"
                        }`}
                      >
                        {post.hidden ? (
                          <MdVisibility size={14} />
                        ) : (
                          <MdVisibilityOff size={14} />
                        )}
                      </button>
                      <button
                        title="Xóa bài đăng"
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">
            Trang {page}/{totalPages} · {total} bài đăng
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-7 text-xs border rounded-lg ${
                  page === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagePosts;
