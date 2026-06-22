import { Routes, Route } from "react-router-dom";
import {
  Home,
  Login,
  Rental,
  Homepage,
  DetailPost,
  SearchDetail,
  Wishlist,
} from "./containers/Public";
import { path } from "./ultils/constant";
import {
  System,
  CreatePost,
  ManagePost,
  ManageAccount,
  Contact,
} from "./containers/System";
import {
  AdminLayout,
  AdminDashboard,
  AdminManageUsers,
  AdminManagePosts,
  AdminManageComments,
} from "./containers/Admin";
import * as actions from "./store/actions";
import { fetchWishlistIds } from "./store/reducers/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    setTimeout(() => {
      isLoggedIn && dispatch(actions.getCurrent());
    }, 1000);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchWishlistIds());
  }, [isLoggedIn]);

  useEffect(() => {
    dispatch(actions.getPrices());
    dispatch(actions.getAreas());
    dispatch(actions.getProvinces());
  }, []);

  return (
    <div className="bg-primary overflow-hidden">
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path={path.HOME} element={<Home />}>
          <Route index element={<Homepage />} />
          <Route path={path.LOGIN} element={<Login />} />
          <Route path={path.PHONG_TRO} element={<Rental />} />
          <Route path={path.NHÀ_NGUYÊN_CĂN} element={<Rental />} />
          <Route path={path.CĂN_HỘ_CHUNG_CƯ} element={<Rental />} />
          <Route path={path.CĂN_HỘ_MINI} element={<Rental />} />
          <Route path={path.SEARCH} element={<SearchDetail />} />
          <Route
            path={path.DETAL_POST__TITLE__POSTID}
            element={<DetailPost />}
          />
          <Route path={path.WISHLIST} element={<Wishlist />} />
          <Route path="*" element={<Homepage />} />
        </Route>

        {/* ===== USER SYSTEM ROUTES ===== */}
        <Route path={path.SYSTEM} element={<System />}>
          <Route path={path.CREATE_POST} element={<CreatePost />} />
          <Route path={path.MANAGE_POST} element={<ManagePost />} />
          <Route path={path.MANAGE_ACCOUNT} element={<ManageAccount />} />
          <Route path={path.CONTACT} element={<Contact />} />
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route path={path.ADMIN} element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path={path.ADMINDASHBOARD} element={<AdminDashboard />} />
          <Route path={path.ADMINMANAGEUSERS} element={<AdminManageUsers />} />
          <Route path={path.ADMINMANAGEPOSTS} element={<AdminManagePosts />} />
          <Route
            path={path.ADMINMANAGECOMMENTS}
            element={<AdminManageComments />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
