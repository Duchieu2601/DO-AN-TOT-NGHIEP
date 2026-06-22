import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../store/actions";
import { apiUpdateUser } from "../../services/user";
import { apiUploadImages } from "../../services";

const inpStyle =
  "w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none " +
  "focus:border-orange-400 focus:ring-1 focus:ring-orange-300 transition bg-white placeholder-gray-400 shadow-sm";

const Toast = ({ type, text }) =>
  text ? (
    <div
      className={`mb-4 px-4 py-3 rounded-md text-sm font-medium border flex items-center gap-2 ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {type === "success" ? "✓" : "✕"} {text}
    </div>
  ) : null;

/* ══════════════════════════════════════════════
   TAB 1 — Thông tin cá nhân
══════════════════════════════════════════════ */
const TabInfo = ({ currentData, changeTab }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    zalo: "",
    fbUrl: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPrev] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  // Load data từ Redux khi mount / currentData thay đổi
  useEffect(() => {
    if (!currentData) return;
    setForm({
      name: currentData.name || "",
      zalo: currentData.zalo || "",
      fbUrl: currentData.fbUrl || "",
    });
    setAvatarUrl(currentData.avatar || "");
    setAvatarPrev(currentData.avatar || "");
  }, [currentData]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setToast({ type: "", text: "" });
  };

  // Upload avatar lên Cloudinary
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", import.meta.env.VITE_UPLOAD_ASSETS_NAME);
      const r = await apiUploadImages(fd);
      if (r.status === 200) {
        setAvatarUrl(r.data.secure_url);
        setAvatarPrev(r.data.secure_url);
        setToast({ type: "success", text: "Tải ảnh lên thành công!" });
      }
    } catch {
      setToast({ type: "error", text: "Upload ảnh thất bại." });
    }
    setUploading(false);
  };

  // Lưu thông tin
  const handleSave = async () => {
    if (!form.name?.trim()) {
      setToast({ type: "error", text: "Vui lòng nhập tên hiển thị." });
      return;
    }
    setSaving(true);
    setToast({ type: "", text: "" });
    try {
      const r = await apiUpdateUser({
        name: form.name,
        zalo: form.zalo,
        fbUrl: form.fbUrl,
        avatar: avatarUrl,
      });
      if (r?.data?.err === 0) {
        setToast({ type: "success", text: "Cập nhật thông tin thành công!" });
        dispatch(actions.getCurrent());
      } else {
        setToast({ type: "error", text: r?.data?.msg || "Cập nhật thất bại." });
      }
    } catch {
      setToast({ type: "error", text: "Lỗi kết nối server." });
    }
    setSaving(false);
  };

  return (
    <div className="w-full">
      <Toast {...toast} />

      {/* Avatar row */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
            {uploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img
                src={
                  avatarPreview ||
                  "https://as1.ftcdn.net/v2/jpg/05/16/27/58/1000_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
                }
                alt="avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">
              {currentData?.name || "Người dùng"}
            </p>
            <p className="text-sm text-gray-500">{currentData?.phone}</p>
          </div>
        </div>
        <label
          htmlFor="avt-upload"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition shadow-sm"
        >
          📷 Đổi ảnh đại diện
        </label>
        <input
          id="avt-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatar}
        />
      </div>

      {/* Form inline */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5 shadow-sm">
        {/* Số điện thoại → click chuyển sang tab đổi SĐT */}
        <div
          onClick={() => changeTab("phone")}
          className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Số điện thoại
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {currentData?.phone}
            </p>
          </div>
          <span className="text-xs text-orange-500 font-medium">
            Thay đổi ❯
          </span>
        </div>

        {/* Tên hiển thị */}
        <div className="px-5 py-3.5 border-b border-gray-100 focus-within:bg-gray-50/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Tên hiển thị
          </p>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Nhập họ và tên"
            className="w-full text-sm font-medium outline-none bg-transparent border-0 p-0 text-gray-800 placeholder-gray-300 focus:ring-0"
          />
        </div>

        {/* Zalo */}
        <div className="px-5 py-3.5 border-b border-gray-100 focus-within:bg-gray-50/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Zalo
          </p>
          <input
            name="zalo"
            value={form.zalo}
            onChange={onChange}
            placeholder="Số Zalo (để trống nếu giống SĐT)"
            className="w-full text-sm font-medium outline-none bg-transparent border-0 p-0 text-gray-800 placeholder-gray-300 focus:ring-0"
          />
        </div>

        {/* Facebook */}
        <div className="px-5 py-3.5 border-b border-gray-100 focus-within:bg-gray-50/30 transition-colors">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Facebook URL
          </p>
          <input
            name="fbUrl"
            value={form.fbUrl}
            onChange={onChange}
            placeholder="https://facebook.com/..."
            className="w-full text-sm font-medium outline-none bg-transparent border-0 p-0 text-gray-800 placeholder-gray-300 focus:ring-0"
          />
        </div>

        {/* Mật khẩu → click chuyển sang tab đổi MK */}
        <div
          onClick={() => changeTab("password")}
          className="px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Mật khẩu
            </p>
            <p className="text-sm text-gray-800 tracking-widest select-none">
              ••••••••
            </p>
          </div>
          <span className="text-xs text-orange-500 font-medium">
            Thay đổi ❯
          </span>
        </div>
      </div>

      {/* Nút cập nhật */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-lg text-sm transition shadow-md flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang lưu...
          </>
        ) : (
          "Cập nhật"
        )}
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════
   TAB 2 — Đổi số điện thoại 
══════════════════════════════════════════════ */
const TabPhone = ({ currentData }) => {
  const dispatch = useDispatch();
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  const handleSave = async () => {
    if (!newPhone.trim()) {
      setToast({ type: "error", text: "Vui lòng nhập số điện thoại mới." });
      return;
    }
    if (newPhone === currentData?.phone) {
      setToast({
        type: "error",
        text: "Số điện thoại mới phải khác số hiện tại.",
      });
      return;
    }
    setSaving(true);
    setToast({ type: "", text: "" });
    try {
      const r = await apiUpdateUser({ phone: newPhone });
      if (r?.data?.err === 0) {
        setToast({
          type: "success",
          text: "Cập nhật số điện thoại thành công!",
        });
        dispatch(actions.getCurrent());
        setNewPhone("");
      } else {
        setToast({ type: "error", text: r?.data?.msg || "Cập nhật thất bại." });
      }
    } catch {
      setToast({ type: "error", text: "Lỗi kết nối server." });
    }
    setSaving(false);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Toast {...toast} />
      <h3 className="font-bold text-gray-900 text-base mb-5 border-b border-gray-100 pb-3">
        Thay đổi số điện thoại
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Số điện thoại hiện tại
          </label>
          <input
            readOnly
            value={currentData?.phone || ""}
            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm bg-gray-50 text-gray-400 outline-none select-none font-medium"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Số điện thoại mới
          </label>
          <input
            value={newPhone}
            onChange={(e) => {
              setNewPhone(e.target.value);
              setToast({ type: "", text: "" });
            }}
            placeholder="Nhập số điện thoại mới"
            className={inpStyle}
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-lg text-sm transition shadow-md flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Cập nhật"
          )}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   TAB 3 — Đổi mật khẩu (ĐÃ HOÀN CHỈNH)
══════════════════════════════════════════════ */
const TabPassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setToast({ type: "", text: "" });
  };

  const handleSave = async () => {
    if (!form.oldPassword) {
      setToast({ type: "error", text: "Vui lòng nhập mật khẩu cũ." });
      return;
    }
    if (!form.newPassword) {
      setToast({ type: "error", text: "Vui lòng nhập mật khẩu mới." });
      return;
    }
    if (form.newPassword.length < 6) {
      setToast({ type: "error", text: "Mật khẩu mới tối thiểu 6 ký tự." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setToast({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }
    setSaving(true);
    try {
      const r = await apiUpdateUser({
        oldPassword: form.oldPassword,
        password: form.newPassword,
      });
      if (r?.data?.err === 0) {
        setToast({ type: "success", text: "Đổi mật khẩu thành công!" });
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setToast({
          type: "error",
          text: r?.data?.msg || "Mật khẩu cũ không đúng.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Lỗi kết nối server." });
    }
    setSaving(false);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Toast {...toast} />
      <h3 className="font-bold text-gray-900 text-base mb-5 border-b border-gray-100 pb-3">
        Thay đổi mật khẩu
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Mật khẩu cũ
          </label>
          <input
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={onChange}
            placeholder="Nhập mật khẩu cũ"
            className={inpStyle}
          />
        </div>
        <a
          href="#forgot"
          className="text-xs text-orange-500 hover:underline font-medium inline-block -mt-1"
        >
          Bạn quên mật khẩu?
        </a>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Mật khẩu mới
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            className={inpStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Nhập lại mật khẩu mới"
            className={inpStyle}
          />
          {form.newPassword &&
            form.confirmPassword &&
            form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
            )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-lg text-sm transition shadow-md flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Cập nhật"
          )}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
const TABS = [
  { id: "info", label: "Thông tin cá nhân" },
  { id: "phone", label: "Đổi số điện thoại" },
  { id: "password", label: "Đổi mật khẩu" },
];

const ManageAccount = () => {
  const { currentData } = useSelector((s) => s.user);
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="w-full min-h-full bg-gray-50 flex flex-col">
      <div className="w-full bg-white border-b border-gray-200 px-8 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Quản lý tài khoản
        </h1>
        <div className="flex gap-6">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "border-orange-500 text-orange-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full px-8 py-6 flex justify-center">
        <div className="max-w-[580px] w-full">
          {activeTab === "info" && (
            <TabInfo currentData={currentData} changeTab={setActiveTab} />
          )}
          {activeTab === "phone" && <TabPhone currentData={currentData} />}
          {activeTab === "password" && <TabPassword />}
        </div>
      </div>
    </div>
  );
};

export default ManageAccount;
