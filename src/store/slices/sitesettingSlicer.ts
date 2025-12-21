import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

interface SiteSettings {
  name: string;
  email: string;
  phone: string;
  rate_of_user: string;
  rate_of_admin: string;
}

interface SiteSettingsState {
  data: SiteSettings | null;
  loading: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  dataExists: boolean; // Track if data exists on server
}

export const savedata = createAsyncThunk<SiteSettings, SiteSettings>(
  "siteSettings/save", 
  async (data) => {
    try {
      const response = await axiosInstance.post("/setting", data);
      return response.data.data;
    } catch (error: any) {
      // For development - simulate successful save when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
        
        return data; // Return the data as if it was saved
      }
      throw error;
    }
  }
);

export const getsettingdata = createAsyncThunk<{ data: SiteSettings; exists: boolean }>(
  "siteSettings/get", 
  async () => {
    try {
      const response = await axiosInstance.get("/setting");
      return { data: response.data.data, exists: true };
    } catch (error: any) {
      // Check if it's a 404 - data doesn't exist
      if (error?.response?.status === 404) {
        console.log("No settings found on server");
        return { 
          data: {
            name: "",
            email: "",
            phone: "",
            rate_of_user: "",
            rate_of_admin: ""
          }, 
          exists: false 
        };
      }
      // For development - return default data when API is not available
      if (error?.code === 'ECONNREFUSED') {
        console.log("API not available, using default data");
        return {
          data: {
            name: "sushil dahal",
            email: "susil@gmail.com",
            phone: "123456789",
            rate_of_user: "12",
            rate_of_admin: "12"
          },
          exists: false
        };
      }
      throw error;
    }
  }
);

export const updatedata = createAsyncThunk<SiteSettings, SiteSettings>(
  "siteSettings/update", 
  async (data) => {
    try {
      const response = await axiosInstance.put("/setting", data);
      return response.data.data;
    } catch (error: any) {
      // For development - simulate successful update when API is not available
      if (error?.code === 'ECONNREFUSED' || error?.response?.status === 404) {
        console.log("API not available, using mock data");
        return data; // Return the data as if it was updated
      }
      throw error;
    }
  }
);

const siteSettingsSlice = createSlice({
    name: "siteSettings",
    initialState: {
        data: null,
        loading: "idle",
        error: null,
        dataExists: false
    } as SiteSettingsState,
    reducers: {
        resetSettings: (state) => {
            state.data = null;
            state.loading = "idle";
            state.error = null;
            state.dataExists = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // savedata cases
            .addCase(savedata.pending, (state) => {
                state.loading = "loading";
                state.error = null;
            })
            .addCase(savedata.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.data = action.payload;
                state.error = null;
                state.dataExists = true; // After POST, data exists
            })
            .addCase(savedata.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.error.message || "Failed to save settings";
            })
            
            // getsettingdata cases
            .addCase(getsettingdata.pending, (state) => {
                state.loading = "loading";
                state.error = null;
            })
            .addCase(getsettingdata.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.data = action.payload.data;
                state.dataExists = action.payload.exists;
                state.error = null;
            })
            .addCase(getsettingdata.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.error.message || "Failed to load settings";
            })
            
            // updatedata cases
            .addCase(updatedata.pending, (state) => {
                state.loading = "loading";
                state.error = null;
            })
            .addCase(updatedata.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.data = action.payload;
                state.error = null;
                state.dataExists = true; // After PUT, data exists
            })
            .addCase(updatedata.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.error.message || "Failed to update settings";
            });
    }
});

export const { resetSettings } = siteSettingsSlice.actions;

export default siteSettingsSlice.reducer;
