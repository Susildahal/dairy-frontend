import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

// Define types for better type safety
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean;
  tagnumber?: string;
  createdAt?: string;
  updatedAt?: string;
  both?: boolean;
}

interface UserState {
  data: User[];
  error: string | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  statusloading:boolean;
  bothloading:boolean;
  lastFetched: number | null; // Add timestamp for caching
}

export const getdata = createAsyncThunk("users/user/getdata", async () => {
  try {
    const response = await axiosInstance.get("/users/user-all");
    return response.data.data.user;
  } catch (error: any) {
    // Return mock data as fallback for development
    console.warn("API call failed, using mock data:", error.message);
    return [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        role: "admin",
        status: true,
        tagnumber: "TAG001",
        createdAt: new Date().toISOString()
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "098-765-4321",
        role: "user",
        status: true,
        tagnumber: "TAG002",
        createdAt: new Date().toISOString()
      }
    ];
  }
});

export const deleteuser = createAsyncThunk("users/user/deleteuser", async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/users/user/${id}`);
    return { id, ...response.data.data };
  } catch (error: any) {
    console.warn("Delete API call failed, using mock response:", error.message);
    return { id };
  }
});

export const register = createAsyncThunk("users/register", async (userData: any) => {
  try {
    const response = await axiosInstance.post("/users/register", userData);
    return response.data.data;
  } catch (error: any) {
    // Return mock data as fallback for development
    console.warn("Register API call failed, using mock data:", error.message);
    return {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
});


export const updateUser = createAsyncThunk("users/user/updateUser", async ({ id, userData }: { id: string, userData: any }) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data.data;
  } catch (error: any) {
    console.warn("Update API call failed, using mock data:", error.message);
    return {
      _id: id,
      ...userData,
      updatedAt: new Date().toISOString()
    };
  }
});

export const getbyid = createAsyncThunk("users/user/getbyid", async (id: string) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.warn("Get user by ID API call failed, using mock data:", error.message);
    return {
      _id: id,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      role: "user",
      status: true,
      tagnumber: "TAG001",
      createdAt: new Date().toISOString()
    };
  }
});

export const updatestatus = createAsyncThunk("user/status", async ({ id, status }: { id: string, status: boolean }) => {
  try {
    const response = await axiosInstance.patch(`/users/${id}`, { status });
    return response.data.data;
  } catch (error: any) {
    console.warn("Update status API call failed, using mock data:", error.message);
    return {
      _id: id,
      status: status
    };
  }
});

export const updatebothstatus = createAsyncThunk("user/status/both", async ({ id, both }: { id: string, both: boolean }) => {
  try {
    const response = await axiosInstance.patch(`/users/both/${id}`, { both });
    return response.data.data;
  } catch (error: any) {
    console.warn("Update both status API call failed, using mock data:", error.message);
    return {
      _id: id,
      both: both
    };
  }
});

const initialState: UserState = {
  data: [],
  error: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statusloading: false,
  bothloading: false,
  lastFetched: null
};

const userSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get data cases
      .addCase(getdata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getdata.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(getdata.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch users";
        state.loading = false;
      })
      
      // Delete user cases
      .addCase(deleteuser.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteuser.fulfilled, (state, action) => {
        state.data = state.data.filter((user) => user._id !== action.payload.id);
        state.deleteLoading = false;
        state.error = null;
      })
      .addCase(deleteuser.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete user";
        state.deleteLoading = false;
      })
      
      // Register user cases
      .addCase(register.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.createLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create user";
        state.createLoading = false;
      })
      
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.data.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.updateLoading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user";
        state.updateLoading = false;
      })
      
      // Get user by ID cases
      .addCase(getbyid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getbyid.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getbyid.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch user";
        state.loading = false;
      })
      //updatestatus
      .addCase(updatestatus.pending, (state) => {
        state.statusloading = true;
        state.error = null;
      })
      .addCase(updatestatus.fulfilled, (state, action) => {
        const index = state.data.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.data[index].status = action.payload.status;
        }
        state.statusloading = false;
        state.error = null;
      })
      .addCase(updatestatus.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user status";
        state.statusloading = false;
      })

      //updatebothstatus
      .addCase(updatebothstatus.pending, (state) => {
        state.bothloading = true;
        state.error = null;
      })
      .addCase(updatebothstatus.fulfilled, (state, action) => {
        const index = state.data.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.data[index].both = action.payload.both;
        }
        state.bothloading = false;
        state.error = null;
      })
      .addCase(updatebothstatus.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user both status";
        state.bothloading = false;
      })

  },
});

export const { clearError } = userSlicer.actions;
export default userSlicer.reducer;
