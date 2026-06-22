import authReducer from "./authReducer";
import userReducer from "./userReducer";
import postReducer from "./postReducer";
import appReducer from "./appReducer";
import wishlistReducer from "./wishlistSlice";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/es/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
const authConfig = {
  key: "auth",
  storage: storage,
  //stateReconciler: autoMergeLevel2,
  whitelist: ["isLoggedIn", "token"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authConfig, authReducer),
  user: userReducer,
  post: postReducer,
  app: appReducer,
  wishlist: wishlistReducer,
});

export default rootReducer;
