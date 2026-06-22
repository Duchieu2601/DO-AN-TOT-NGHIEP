import React, { useEffect, useState } from "react";
import {
  MdPeople,
  MdArticle,
  MdCheckCircle,
  MdBlock,
  MdVisibilityOff,
  MdComment,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { path } from "../../ultils/constant";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BASE = import.meta.env.VITE_REACT_APP_SERVER_URL || "";

// ─── Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, bg, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
    </div>
    <div className="text-3xl font-bold text-gray-800">
      {value === null ? (
        <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded" />
      ) : (
        value
      )}
    </div>
    {sub && <div className={`text-xs font-medium ${color}`}>{sub}</div>}
  </div>
);

// ─── Chart Card wrapper ───────────────────────────────────────────────
const ChartCard = ({ title, children, loading }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
    {loading ? (
      <div className="h-48 flex items-center justify-center text-gray-300 text-sm animate-pulse">
        Đang tải...
      </div>
    ) : (
      children
    )}
  </div>
);

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);

  const [userStats, setUserStats] = useState({
    total: null,
    active: null,
    banned: null,
  });
  const [postStats, setPostStats] = useState({
    total: null,
    visible: null,
    hidden: null,
  });
  const [commentStats, setCommentStats] = useState({ total: null });
  const [chartData, setChartData] = useState({
    monthly: [],
    byProvince: [],
    byCategory: [],
  });
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // Stats cơ bản
    axios
      .get(`${BASE}/api/admin/stats/users`, { headers })
      .then((res) => {
        if (res.data?.err === 0) setUserStats(res.data);
      })
      .catch(() => {});

    axios
      .get(`${BASE}/api/admin/stats/posts`, { headers })
      .then((res) => {
        if (res.data?.err === 0) setPostStats(res.data);
      })
      .catch(() => {});

    axios
      .get(`${BASE}/api/admin/stats/comments`, { headers })
      .then((res) => {
        if (res.data?.err === 0) setCommentStats(res.data);
      })
      .catch(() => {});

    // Chart data
    setChartLoading(true);
    axios
      .get(`${BASE}/api/admin/stats/charts`, { headers })
      .then((res) => {
        if (res.data?.err === 0) setChartData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, [token]);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Banner chào */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 text-white flex items-center justify-between shadow">
        <div>
          <p className="text-indigo-200 text-sm">Xin chào,</p>
          <h1 className="text-2xl font-bold mt-0.5">
            {currentData?.name || "Quản trị viên"} 👋
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Bảng điều khiển — Phòng trọ sinh viên
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {currentData?.name?.charAt(0) || "A"}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={userStats.total}
          sub="↗ Xem tất cả"
          color="text-indigo-500"
          bg="bg-indigo-50"
          icon={<MdPeople size={20} className="text-indigo-600" />}
          onClick={() => navigate(`/admin/${path.ADMINMANAGEUSERS}`)}
        />
        <StatCard
          label="Người dùng bị cấm"
          value={userStats.banned}
          sub={userStats.banned > 0 ? "⚠ Cần xem xét" : "✓ Ổn"}
          color={userStats.banned > 0 ? "text-red-500" : "text-green-500"}
          bg="bg-red-50"
          icon={<MdBlock size={20} className="text-red-500" />}
          onClick={() => navigate(`/admin/${path.ADMINMANAGEUSERS}`)}
        />
        <StatCard
          label="Tổng bài đăng"
          value={postStats.total}
          sub="↗ Xem tất cả"
          color="text-blue-500"
          bg="bg-blue-50"
          icon={<MdArticle size={20} className="text-blue-600" />}
          onClick={() => navigate(`/admin/${path.ADMINMANAGEPOSTS}`)}
        />
        <StatCard
          label="Tổng bình luận"
          value={commentStats.total}
          sub="↗ Xem tất cả"
          color="text-purple-500"
          bg="bg-purple-50"
          icon={<MdComment size={20} className="text-purple-600" />}
          onClick={() => navigate(`/admin/quan-ly-binh-luan`)}
        />
      </div>

      {/* ── Biểu đồ row 1 ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bài đăng theo tháng - AreaChart */}
        <div className="col-span-2">
          <ChartCard
            title="📈 Bài đăng theo tháng (12 tháng gần nhất)"
            loading={chartLoading}
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData.monthly}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="posts"
                  name="Bài đăng"
                  stroke="#6366f1"
                  fill="url(#colorPosts)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Người dùng mới"
                  stroke="#22c55e"
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Tỉ lệ bài đăng - PieChart */}
        <ChartCard title="🥧 Trạng thái bài đăng" loading={chartLoading}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Hiển thị", value: postStats.visible || 0 },
                  { name: "Đã ẩn", value: postStats.hidden || 0 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill="#6366f1" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Biểu đồ row 2 ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top tỉnh thành - BarChart */}
        <ChartCard
          title="🏙️ Top 8 tỉnh/thành có nhiều tin nhất"
          loading={chartLoading}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData.byProvince}
              margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Số bài" radius={[4, 4, 0, 0]}>
                {chartData.byProvince.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Theo danh mục - BarChart ngang */}
        <ChartCard title="🏠 Bài đăng theo loại phòng" loading={chartLoading}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData.byCategory}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Số bài" radius={[0, 4, 4, 0]}>
                {chartData.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Quản lý người dùng",
              desc: "Xem, cấm, xóa tài khoản",
              icon: <MdPeople size={22} className="text-indigo-600" />,
              bg: "bg-indigo-50 group-hover:bg-indigo-100",
              to: `/admin/${path.ADMINMANAGEUSERS}`,
            },
            {
              label: "Quản lý bài đăng",
              desc: "Ẩn, xóa bài vi phạm",
              icon: <MdArticle size={22} className="text-blue-600" />,
              bg: "bg-blue-50 group-hover:bg-blue-100",
              to: `/admin/${path.ADMINMANAGEPOSTS}`,
            },
            {
              label: "Quản lý bình luận",
              desc: "Xóa bình luận nhạy cảm",
              icon: <MdComment size={22} className="text-purple-600" />,
              bg: "bg-purple-50 group-hover:bg-purple-100",
              to: `/admin/quan-ly-binh-luan`,
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group"
            >
              <div className={`p-3 rounded-xl transition-colors ${item.bg}`}>
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
