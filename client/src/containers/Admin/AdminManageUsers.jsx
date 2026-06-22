import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdSearch,
  MdDelete,
  MdBlock,
  MdLockOpen,
  MdRefresh,
} from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { useSelector } from "react-redux";

const BASE = import.meta.env.VITE_REACT_APP_SERVER_URL || "";

const AdminManageUsers = () => {
  const { token } = useSelector((state) => state.auth); // lấy token từ redux
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState({ text: "", type: "info" });
  const limit = 10;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/admin/users`, {
        headers,
        params: { page: p, limit, search: q },
      });
      if (res.data?.err === 0) {
        setUsers(res.data.rows || []);
        setTotal(res.data.count || 0);
        setTotalPages(Math.ceil((res.data.count || 0) / limit) || 1);
      }
    } catch (e) {
      showMsg(
        "Không thể tải danh sách người dùng: " +
          (e.response?.data?.msg || e.message),
        "error",
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const showMsg = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "info" }), 3000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Xóa người dùng "${name}"? Thao tác này không thể hoàn tác!`,
      )
    )
      return;
    try {
      await axios.delete(`${BASE}/api/admin/users/${id}`, { headers });
      showMsg(`Đã xóa người dùng ${name}`, "success");
      fetchUsers(page, search);
    } catch (e) {
      showMsg("Xóa thất bại: " + (e.response?.data?.msg || e.message), "error");
    }
  };

  const handleToggleBan = async (id, isBanned, name) => {
    const action = isBanned ? "gỡ cấm" : "cấm";
    if (!window.confirm(`Xác nhận ${action} người dùng "${name}"?`)) return;
    try {
      await axios.patch(
        `${BASE}/api/admin/users/${id}/ban`,
        { banned: !isBanned },
        { headers },
      );
      showMsg(`Đã ${action} người dùng ${name}`, "success");
      fetchUsers(page, search);
    } catch (e) {
      showMsg(
        "Thao tác thất bại: " + (e.response?.data?.msg || e.message),
        "error",
      );
    }
  };

  // Tạo avatar chữ cái từ tên
  const getInitial = (name = "") =>
    name.trim().split(" ").pop().charAt(0).toUpperCase() || "U";
  const avatarColors = [
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
  ];

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
          <h1 className="text-xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng cộng{" "}
            <span className="font-semibold text-gray-600">{total}</span> người
            dùng
          </p>
        </div>
        <button
          onClick={() => fetchUsers(page, search)}
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

      {/* Tìm kiếm */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại..."
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
              fetchUsers(1, "");
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Không tìm thấy người dùng nào.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {/* STT */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  {/* Tên + Avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}
                        >
                          {getInitial(user.name)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.name || "(chưa đặt tên)"}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {user.id?.match(/\d/g)?.join("")?.slice(0, 6) ||
                            user.id?.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Liên hệ */}
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{user.phone || "—"}</div>
                    {user.zalo && (
                      <div className="text-xs text-blue-500">
                        Zalo: {user.zalo}
                      </div>
                    )}
                  </td>
                  {/* Vai trò */}
                  <td className="px-4 py-3">
                    {user.role === "admin" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Người dùng
                      </span>
                    )}
                  </td>
                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                        ⛔ Bị cấm
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ Hoạt động
                      </span>
                    )}
                  </td>
                  {/* Ngày tạo */}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  {/* Hành động */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Xem chi tiết"
                        onClick={() =>
                          alert(
                            `👤 Thông tin người dùng\n\nTên: ${user.name}\nĐiện thoại: ${user.phone}\nZalo: ${user.zalo || "—"}\nFacebook: ${user.fbUrl || "—"}\nVai trò: ${user.role}\nTrạng thái: ${user.banned ? "Bị cấm" : "Hoạt động"}`,
                          )
                        }
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                      >
                        <FiEye size={14} />
                      </button>
                      {user.role !== "admin" && (
                        <button
                          title={user.banned ? "Gỡ cấm" : "Cấm người dùng"}
                          onClick={() =>
                            handleToggleBan(user.id, user.banned, user.name)
                          }
                          className={`p-1.5 rounded-lg border hover:opacity-80 ${
                            user.banned
                              ? "border-green-200 text-green-600 hover:bg-green-50"
                              : "border-orange-200 text-orange-500 hover:bg-orange-50"
                          }`}
                        >
                          {user.banned ? (
                            <MdLockOpen size={14} />
                          ) : (
                            <MdBlock size={14} />
                          )}
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          title="Xóa người dùng"
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <MdDelete size={14} />
                        </button>
                      )}
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
            Trang {page}/{totalPages} · {total} người dùng
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
    </div>
  );
};

export default AdminManageUsers;
