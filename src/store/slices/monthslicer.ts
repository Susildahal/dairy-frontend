import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

interface Month {
  _id: string;
  year: number;
  month: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MonthState {
  months: Month[];
  activeMonth: Month | null;
  loading: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  activateLoading: boolean;
}

interface CreateMonthData {
  year: number;
  month: string;
  status?: boolean;
}

// Create a new month
export const createMonth = createAsyncThunk<Month, CreateMonthData>(
  "months/create",
  async (monthData) => {
    try {
      const response = await axiosInstance.post("/months", monthData);
      return response.data.data;
    } catch (error: any) {
      // For development - simulate successful creation when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
        console.log("API not available, using mock data");
        return {
          _id: Date.now().toString(),
          year: monthData.year,
          month: monthData.month,
          status: monthData.status || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }
);

// Get all months
export const getAllMonths = createAsyncThunk<Month[]>(
  "months/getAll",
  async () => {
    try {
      const response = await axiosInstance.get("/months");
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }
);

// Get months by year
export const getMonthsByYear = createAsyncThunk<Month[], number>(
  "months/getByYear",
  async (year) => {
    try {
      const response = await axiosInstance.get(`/months/year/${year}`);
      return response.data.data;
    } catch (error: any) {
      // For development - return filtered mock data when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
    
      }
      throw error;
    }
  }
);

// Activate a month
export const activateMonth = createAsyncThunk<Month, string>(
  "months/activate",
  async (monthId) => {
    try {
      const response = await axiosInstance.patch(`/months/${monthId}/activate`);
      return response.data.data;
    } catch (error: any) {
      // For development - simulate activation when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
      }
      throw error;
    }
  }
);

// Get active month
export const getActiveMonth = createAsyncThunk<Month>(
  "months/getActive",
  async () => {
    try {
      const response = await axiosInstance.get("/months/active");
      return response.data.data;
    } catch (error: any) {
      // For development - return mock active month when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {

      }
      throw error;
    }
  }
);

// Delete a month
export const deleteMonth = createAsyncThunk<string, string>(
  "months/delete",
  async (monthId) => {
    try {
      await axiosInstance.delete(`/months/${monthId}`);
      return monthId;
    } catch (error: any) {
      // For development - simulate successful deletion when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
        console.log("API not available, simulating deletion");
        return monthId;
      }
      throw error;
    }
  }
);

const monthSlice = createSlice({
  name: "months",
  initialState: {
    months: [],
    activeMonth: null,
    loading: "idle",
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    activateLoading: false,
  } as MonthState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveMonth: (state, action: PayloadAction<Month | null>) => {
      state.activeMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create month
      .addCase(createMonth.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createMonth.fulfilled, (state, action) => {
        state.createLoading = false;
        state.months.push(action.payload);
        // If the new month is active, deactivate others and set as active
        if (action.payload.status) {
          state.months.forEach(month => {
            if (month._id !== action.payload._id) {
              month.status = false;
            }
          });
          state.activeMonth = action.payload;
        }
      })
      .addCase(createMonth.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.error.message || "Failed to create month";
      })

      // Get all months
      .addCase(getAllMonths.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(getAllMonths.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.months = action.payload;
        // Set active month if exists
        const activeMonth = action.payload.find(month => month.status);
        state.activeMonth = activeMonth || null;
      })
      .addCase(getAllMonths.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to fetch months";
      })

      // Get months by year
      .addCase(getMonthsByYear.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(getMonthsByYear.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.months = action.payload;
      })
      .addCase(getMonthsByYear.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to fetch months by year";
      })

      // Activate month
      .addCase(activateMonth.pending, (state) => {
        state.activateLoading = true;
        state.error = null;
      })
      .addCase(activateMonth.fulfilled, (state, action) => {
        state.activateLoading = false;
        // Deactivate all months and activate the selected one
        state.months.forEach(month => {
          month.status = month._id === action.payload._id;
        });
        state.activeMonth = action.payload;
      })
      .addCase(activateMonth.rejected, (state, action) => {
        state.activateLoading = false;
        state.error = action.error.message || "Failed to activate month";
      })

      // Get active month
      .addCase(getActiveMonth.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(getActiveMonth.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.activeMonth = action.payload;
      })
      .addCase(getActiveMonth.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to fetch active month";
      })

      // Delete month
      .addCase(deleteMonth.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteMonth.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.months = state.months.filter(month => month._id !== action.payload);
        // If deleted month was active, clear active month
        if (state.activeMonth?._id === action.payload) {
          state.activeMonth = null;
        }
      })
      .addCase(deleteMonth.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.error.message || "Failed to delete month";
      });
  },
});

export const { clearError, setActiveMonth } = monthSlice.actions;
export default monthSlice.reducer;