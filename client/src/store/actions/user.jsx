import actionTypes from "./actionTypes";
import * as apis from "../../services";

export const getCurrent = () => async (dispatch) => {
  try {
    const response = await apis.apiGetCurrent();
    if (response?.data.err === 0) {
      dispatch({
        type: actionTypes.GET_CURRENT,
        currentData: response.data.response,
      });
    } else {
      // err: 3 = bị banned → thông báo trước khi logout
      if (response?.data.err === 3) {
        alert("⛔ Tài khoản của bạn đã bị khóa bởi quản trị viên.");
      }
      dispatch({
        type: actionTypes.GET_CURRENT,
        msg: response.data.msg,
        currentData: null,
      });
      dispatch({ type: actionTypes.LOGOUT });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_CURRENT,
      currentData: null,
      msg: error,
    });
    dispatch({ type: actionTypes.LOGOUT });
  }
};
