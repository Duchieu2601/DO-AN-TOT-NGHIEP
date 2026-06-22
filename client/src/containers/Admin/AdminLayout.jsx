import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import { path } from "../../ultils/constant";
import { Header } from "../System";
import * as actions from "../../store/actions";
import { AiOutlineLogout } from "react-icons/ai";
import { MdDashboard, MdPeople, MdArticle, MdComment } from "react-icons/md";

const activeStyle =
  "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600";
const notActiveStyle =
  "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer border-l-4 border-transparent transition-colors";

const menuAdmin = [
  {
    id: 1,
    text: "Dashboard",
    path: `/admin/${path.ADMINDASHBOARD}`,
    icon: <MdDashboard size={18} />,
  },
  {
    id: 2,
    text: "Người dùng",
    path: `/admin/${path.ADMINMANAGEUSERS}`,
    icon: <MdPeople size={18} />,
  },
  {
    id: 3,
    text: "Bài đăng",
    path: `/admin/${path.ADMINMANAGEPOSTS}`,
    icon: <MdArticle size={18} />,
  },
  {
    id: 4,
    text: "Bình luận",
    path: `/admin/${path.ADMINMANAGECOMMENTS}`,
    icon: <MdComment size={18} />,
  },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);

  if (!isLoggedIn) return <Navigate to={`/${path.LOGIN}`} replace />;

  if (currentData && currentData.role !== "admin") {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col gap-3">
        <div className="text-5xl">🚫</div>
        <div className="text-xl font-bold text-gray-700">
          Không có quyền truy cập
        </div>
        <p className="text-gray-400 text-sm">
          Trang này chỉ dành cho quản trị viên.
        </p>
        <a href="/" className="mt-2 text-indigo-600 text-sm hover:underline">
          ← Về trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[220px] flex-none bg-white border-r border-gray-200 flex flex-col py-4 gap-1">
          <div className="px-4 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Admin Panel
            </span>
          </div>

          {menuAdmin.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                isActive ? activeStyle : notActiveStyle
              }
            >
              {item.icon}
              {item.text}
            </NavLink>
          ))}

          <div className="mt-auto border-t border-gray-100 pt-3 mx-2">
            <div className="flex items-center gap-3 px-2 py-2 mb-1">
              {currentData?.avatar ? (
                <img
                  src={currentData.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentData?.name?.charAt(0) || "A"}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {currentData?.name || "Admin"}
                </span>
                <span className="text-xs text-indigo-600 font-semibold">
                  Quản trị viên
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(actions.logout())}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-red-500 hover:bg-red-50 cursor-pointer border-l-4 border-transparent transition-colors w-full"
            >
              <AiOutlineLogout size={18} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
