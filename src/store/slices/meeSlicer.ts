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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getmee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getmee.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getmee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default meeSlicer.reducer