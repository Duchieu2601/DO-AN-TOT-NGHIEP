import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetWishlistIds, apiToggleWishlist } from "../../services/wishlist";

export const fetchWishlistIds = createAsyncThunk(
  "wishlist/fetchIds",
  async () => {
    const res = await apiGetWishlistIds();
    return res.data.response;
  },
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (postId, { dispatch }) => {
    await apiToggleWishlist(postId);
    dispatch(fetchWishlistIds());
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { ids: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistIds.fulfilled, (state, action) => {
      state.ids = action.payload || [];
    });
  },
});

export default wishlistSlice.reducer;
