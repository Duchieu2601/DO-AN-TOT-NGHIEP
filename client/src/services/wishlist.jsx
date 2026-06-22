import axiosConfig from "../axiosConfig";

export const apiToggleWishlist = (postId) =>
  axiosConfig.post(`/api/wishlists/toggle/${postId}`);
export const apiGetWishlists = () => axiosConfig.get("/api/wishlists");
export const apiGetWishlistIds = () => axiosConfig.get("/api/wishlists/ids");
