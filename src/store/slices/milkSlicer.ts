import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../utils/axiosInstance'

export interface MilkEntry {
  _id: string
  userid: string
  name: string
  todaymilk: number
  todaymoney: number
  todayfit: number
  monthid: string
  session: 'morning' | 'night'  // Add session field
  createdAt: string
  updatedAt?: string
}

export interface UserTotal {
  _id: string
  userid: string
  name: string
  totalMilk: number
  totalMoney: number
  monthid: string
  monthName?: string
  monthDetails?: any
  createdAt?: string
  updatedAt?: string
}

export interface AdminTotal {
  _id: string
  monthid: string
  totalMilk: number
  totalMoney: number
  monthName?: string
  monthDetails?: any
  createdAt?: string
  updatedAt?: string
}

interface MilkState {
  milkEntries: MilkEntry[]
  userTotals: UserTotal[]
  adminTotals: AdminTotal[]
  userHistory: MilkEntry[]
  monthTotals: UserTotal[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
  loading: boolean
  saveLoading: boolean
  userHistoryLoading: boolean
  monthTotalsLoading: boolean
  error: string | null
}

const initialState: MilkState = {
  milkEntries: [],
  userTotals: [],
  adminTotals: [],
  userHistory: [],
  monthTotals: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null
  },
  loading: false,
  saveLoading: false,
  userHistoryLoading: false,
  monthTotalsLoading: false,
  error: null
}

// Save milk entry with session type - POST /milk/savemilk
export const saveMilk = createAsyncThunk(
  'milk/saveMilk',
  async (milkData: {
    userid: string
    name: string
    todaymilk: number
    todaymoney: number
    todayfit: number
    session?: 'morning' | 'night'  // Add session type
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/milk/savemilk', milkData)
      
      // Handle different response formats
      if (response.status === 200 || response.status === 201) {
        // Check if response has the expected structure
        if (response.data) {
          return response.data.data || response.data
        }
        return response.data
      } else {
        return rejectWithValue(`Unexpected response status: ${response.status}`)
      }
    } catch (error: any) {
      console.error('SaveMilk API Error:', error)
      
      // Check if it's a network error but data was actually saved
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status
        const message = error.response.data?.message || error.response.data?.error || `Server error (${status})`
        return rejectWithValue(message)
      } else if (error.request) {
        // Network error - request was made but no response
        return rejectWithValue('Network error - please check your connection')
      } else {
        // Something else happened
        return rejectWithValue(error.message || 'Unknown error occurred')
      }
    }
  }
)

// Get all milk entries with advanced filtering - GET /milk/allmilk
export const getAllMilk = createAsyncThunk(
  'milk/getAllMilk',
  async (filters?: {
    session?: 'morning' | 'night'
    monthid?: string
    userid?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    try {
      const params: any = {}
      
      if (filters) {
        if (filters.session) params.session = filters.session
        if (filters.monthid) params.monthid = filters.monthid
        if (filters.userid) params.userid = filters.userid
        if (filters.startDate) params.startDate = filters.startDate
        if (filters.endDate) params.endDate = filters.endDate
        if (filters.page) params.page = filters.page
        if (filters.limit) params.limit = filters.limit
      }
      
      const response = await axiosInstance.get('/milk/allmilk', { params })
      
      // Return both data and pagination
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        count: response.data.count
      }
    } catch (error: any) {
      throw error
    }
  }
)

// Update milk entry - PUT /milk/updatemilk/:id
export const updateMilk = createAsyncThunk(
  'milk/updateMilk',
  async ({ 
    id, 
    updateData 
  }: { 
    id: string, 
    updateData: {
      userid: string
      name: string
      todaymilk: number
      todaymoney: number
      todayfit: number
      session: 'morning' | 'night'
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/milk/updatemilk/${id}`, updateData)
      
      if (response.status === 200) {
        return response.data
      } else {
        return rejectWithValue(`Unexpected response status: ${response.status}`)
      }
    } catch (error: any) {
      console.error('UpdateMilk API Error:', error)
      
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`
        return rejectWithValue(message)
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection')
      } else {
        return rejectWithValue(error.message || 'Unknown error occurred')
      }
    }
  }
)

// Get daily user history with optional session filter - GET /milk/dailyuserhistory
export const getDailyUserHistory = createAsyncThunk(
  'milk/getDailyUserHistory',
  async (session: 'morning' | 'night' | undefined, { rejectWithValue }) => {
    try {
      const params: any = {}
      if (session) {
        params.session = session
      }
      
      const response = await axiosInstance.get('/milk/dailyuserhistory', { params })
      
      if (response.status === 200) {
        return response.data.data || response.data
      } else {
        return rejectWithValue(`Unexpected response status: ${response.status}`)
      }
    } catch (error: any) {
      console.error('GetDailyUserHistory API Error:', error)
      
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`
        return rejectWithValue(message)
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection')
      } else {
        return rejectWithValue(error.message || 'Unknown error occurred')
      }
    }
  }
)

// Thunk to delete a milk entry
export const deleteMilk = createAsyncThunk(
    'milk/deleteMilk',
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/milk/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete milk entry');
        }
    }
);

const milkSlice = createSlice({
  name: 'milk',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Save milk
      .addCase(saveMilk.pending, (state) => {
        state.saveLoading = true
        state.error = null
      })
      .addCase(saveMilk.fulfilled, (state, action) => {
        state.saveLoading = false
        state.milkEntries.unshift(action.payload.daily)
        
        // Update user totals
        const existingUserTotalIndex = state.userTotals.findIndex(
          total => total.userid === action.payload.userTotal.userid
        )
        if (existingUserTotalIndex >= 0) {
          state.userTotals[existingUserTotalIndex] = action.payload.userTotal
        } else {
          state.userTotals.push(action.payload.userTotal)
        }
        
        // Update admin totals
        const existingAdminTotalIndex = state.adminTotals.findIndex(
          total => total.monthid === action.payload.adminTotal.monthid
        )
        if (existingAdminTotalIndex >= 0) {
          state.adminTotals[existingAdminTotalIndex] = action.payload.adminTotal
        } else {
          state.adminTotals.push(action.payload.adminTotal)
        }
      })
      .addCase(saveMilk.rejected, (state, action) => {
        state.saveLoading = false
        state.error = action.error.message || 'Failed to save milk entry'
      })
      
      // Get all milk entries
      .addCase(getAllMilk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllMilk.fulfilled, (state, action) => {
        state.loading = false
        state.milkEntries = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getAllMilk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch milk entries'
      })
      
      // Update milk entry
      .addCase(updateMilk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMilk.fulfilled, (state, action) => {
        state.loading = false
        
        // Update the milk entry in the list
        const index = state.milkEntries.findIndex(entry => entry._id === action.payload._id)
        if (index !== -1) {
          state.milkEntries[index] = action.payload
        }
      })
      .addCase(updateMilk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to update milk entry'
      })
      
      // Get daily user history
      .addCase(getDailyUserHistory.pending, (state) => {
        state.userHistoryLoading = true
        state.error = null
      })
      .addCase(getDailyUserHistory.fulfilled, (state, action) => {
        state.userHistoryLoading = false
        state.userHistory = action.payload
      })
      .addCase(getDailyUserHistory.rejected, (state, action) => {
        state.userHistoryLoading = false
        state.error = action.error.message || 'Failed to fetch user history'
      })
      // Delete milk entry
      .addCase(deleteMilk.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteMilk.fulfilled, (state, action) => {
        state.loading = false
        state.milkEntries = state.milkEntries.filter(entry => entry._id !== action.payload)
      })
      .addCase(deleteMilk.rejected, (state, action) => {
        state.loading = false
        
      })
  }
})

export const { clearError } = milkSlice.actions
export default milkSlice.reducer