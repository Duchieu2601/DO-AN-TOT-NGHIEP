import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdSearch, MdDelete, MdRefresh, MdStar } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { useSelector } from "react-redux";

const BASE = import.meta.env.VITE_REACT_APP_SERVER_URL || "";

const SENSITIVE_WORDS = [
  "lừa đảo",
  "scam",
  "giả mạo",
  "chửi",
  "địt",
  "đụ",
  "fuck",
  "shit",
  "con chó",
  "thằng chó",
  "đồ chó",
  "ngu",
  "óc chó",
  "mẹ mày",
  "bố mày",
  "dm",
  "vl",
  "vcl",
  "đmm",
  "đm",
  "cút",
  "xéo",
];

const isSensitive = (content = "") => {
  const lower = content.toLowerCase();
  return SENSITIVE_WORDS.some((w) => lower.includes(w));
};

const highlightSensitive = (content = "") => {
  let result = content;
  SENSITIVE_WORDS.forEach((word) => {
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(
      regex,
      `<mark class="bg-red-200 text-red-800 rounded px-0.5">$1</mark>`,
    );
  });
  return result;
};

const StarDisplay = ({ star }) => {
  if (!star) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <MdStar
          key={i}
          size={14}
          className={i < star ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
};

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "sensitive", label: "⚠ Nhạy cảm" },
];

const PAGE_SIZE = 15;

const AdminManageComments = () => {
  const { token } = useSelector((state) => state.auth);
  const [allComments, setAllComments] = useState([]); // toàn bộ data từ server
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tabFilter, setTabFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "info" });
  const [preview, setPreview] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch tất cả comment từ server (không phân trang ở server)
  const fetchComments = async (q = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/admin/comments`, {
        headers,
        params: { page: 1, limit: 9999, search: q },
      });
      if (res.data?.err === 0) {
        setAllComments(res.data.rows || []);
      }
    } catch (e) {
      showMsg(
        "Không thể tải bình luận: " + (e.response?.data?.msg || e.message),
        "error",
      );
    }
    setLoading(false);
    setSelected([]);
  };

  useEffect(() => {
    fetchComments(search);
  }, []);

  const showMsg = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "info" }), 3000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    fetchComments(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    fetchComments("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await axios.delete(`${BASE}/api/admin/comments/${id}`, { headers });
      showMsg("Đã xóa bình luận.", "success");
      setAllComments((prev) => prev.filter((c) => c.id !== id));
      if (preview?.id === id) setPreview(null);
    } catch (e) {
      showMsg("Xóa thất bại: " + (e.response?.data?.msg || e.message), "error");
    }
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Xóa ${selected.length} bình luận đã chọn?`)) return;
    try {
      await axios.delete(`${BASE}/api/admin/comments`, {
        headers,
        data: { ids: selected },
      });
      showMsg(`Đã xóa ${selected.length} bình luận.`, "success");
      setAllComments((prev) => prev.filter((c) => !selected.includes(c.id)));
      setSelected([]);
    } catch (e) {
      showMsg("Xóa thất bại.", "error");
    }
  };

  // ── Lọc + phân trang ở frontend ─────────────────────────────────
  const filtered = allComments.filter((c) => {
    if (tabFilter === "sensitive") return isSensitive(c.content);
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sensitiveCount = allComments.filter((c) =>
    isSensitive(c.content),
  ).length;

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleSelectAll = () =>
    setSelected(
      selected.length === paginated.length ? [] : paginated.map((c) => c.id),
    );

  const msgStyle = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý bình luận</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng{" "}
            <span className="font-semibold text-gray-600">
              {allComments.length}
            </span>{" "}
            bình luận
            {sensitiveCount > 0 && (
              <span className="ml-2 text-red-500 font-semibold">
                · ⚠ {sensitiveCount} có nội dung nhạy cảm
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <MdDelete size={16} /> Xóa {selected.length} mục
            </button>
          )}
          <button
            onClick={() => fetchComments(search)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <MdRefresh size={16} /> Làm mới
          </button>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTabFilter(tab.key);
              setPage(1);
              setSelected([]);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tabFilter === tab.key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.key === "sensitive" && sensitiveCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">
                {sensitiveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tìm kiếm */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung bình luận..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
            onClick={handleClearSearch}
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
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {tabFilter === "sensitive"
              ? "Không có bình luận nhạy cảm nào."
              : "Không có bình luận nào."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Bài đăng
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((comment, idx) => {
                const sensitive = isSensitive(comment.content);
                return (
                  <tr
                    key={comment.id}
                    className={`border-b border-gray-50 transition-colors ${
                      sensitive
                        ? "bg-red-50 hover:bg-red-100"
                        : "hover:bg-gray-50"
                    } ${selected.includes(comment.id) ? "!bg-indigo-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {comment.user?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {comment.user?.phone || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex items-start gap-2">
                        {sensitive && (
                          <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600">
                            ⚠
                          </span>
                        )}
                        <p
                          className="text-gray-700 text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightSensitive(comment.content),
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div
                        className="text-gray-700 text-xs truncate"
                        title={comment.post?.title}
                      >
                        {comment.post?.title || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay star={comment.star} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Xem đầy đủ"
                          onClick={() => setPreview(comment)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          title="Xóa bình luận"
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">
            Trang {page}/{totalPages} · {filtered.length} bình luận
            {tabFilter === "sensitive" ? " nhạy cảm" : ""}
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
                className={`w-8 h-7 text-xs border rounded-lg ${page === p ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 hover:bg-gray-100"}`}
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

      {/* Modal chi tiết */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">
                Chi tiết bình luận
              </h2>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 flex-shrink-0">
                  Người dùng:
                </span>
                <span className="font-medium text-gray-800">
                  {preview.user?.name} — {preview.user?.phone}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 flex-shrink-0">
                  Bài đăng:
                </span>
                <span className="text-gray-700">
                  {preview.post?.title || "—"}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-400 w-24 flex-shrink-0">
                  Đánh giá:
                </span>
                <StarDisplay star={preview.star} />
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 flex-shrink-0">
                  Thời gian:
                </span>
                <span className="text-gray-700">
                  {new Date(preview.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">Nội dung:</span>
                <div
                  className={`p-3 rounded-lg text-gray-800 leading-relaxed ${isSensitive(preview.content) ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}
                  dangerouslySetInnerHTML={{
                    __html: highlightSensitive(preview.content),
                  }}
                />
                {isSensitive(preview.content) && (
                  <p className="text-xs text-red-500 font-medium">
                    ⚠ Bình luận có nội dung nhạy cảm
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDelete(preview.id);
                  setPreview(null);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <MdDelete size={16} /> Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageComments;
