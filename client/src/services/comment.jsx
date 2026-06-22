// services/comment.js
import axiosConfig from "../axiosConfig";

export const apiGetComments = (postId) =>
  axiosConfig.get(`/api/comments/${postId}`);
export const apiCreateComment = (postId, data) =>
  axiosConfig.post(`/api/comments/${postId}`, data);
export const apiDeleteComment = (commentId) =>
  axiosConfig.delete(`/api/comments/${commentId}`);
