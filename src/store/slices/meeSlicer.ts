import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axiosInstance"


export const getmee = createAsyncThunk("get/mee", async () => {
  const response = await axiosInstance.get("/users/me")
  return response.data.data
})


const meeSlicer = createSlice({
  name: "mee",
  initialState: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null, // Add timestamp to track when data was last fetched
  },
  reducers: {
    clearMeeData: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getmee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getmee.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(getmee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        // Clear user data on authentication failure
        if (action.error.message?.includes('401') || action.error.message?.includes('Unauthorized')) {
          state.data = null
          state.lastFetched = null
        }
      })
  },
})

export const { clearMeeData } = meeSlicer.actions
export default meeSlicer.reducer