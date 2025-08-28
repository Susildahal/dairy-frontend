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
  createdAt: string
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
  loading: false,
  saveLoading: false,
  userHistoryLoading: false,
  monthTotalsLoading: false,
  error: null
}

// Save milk entry - POST /milk/savemilk
export const saveMilk = createAsyncThunk(
  'milk/saveMilk',
  async (milkData: {
    userid: string
    name: string
    todaymilk: number
    todaymoney: number
    todayfit: number
  }) => {
    try {
      const response = await axiosInstance.post('/milk/savemilk', milkData)
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

// Get all milk entries - GET /milk/allmilk
export const getAllMilk = createAsyncThunk(
  'milk/getAllMilk',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/allmilk')
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

// Get daily user history - GET /milk/dailyuserhistory (auth-based)
export const getDailyUserHistory = createAsyncThunk(
  'milk/getDailyUserHistory',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/dailyuserhistory')
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

// Get admin total - GET /milk/admin-total
export const getAdminTotal = createAsyncThunk(
  'milk/getAdminTotal',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/admin-total')
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

// Get user monthly total - GET /milk/usermonthly (auth-based)
export const getUserMonthly = createAsyncThunk(
  'milk/getUserMonthly',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/usermonthly')
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

// Get total month data - GET /milk/total-month
export const getTotalMonth = createAsyncThunk(
  'milk/getTotalMonth',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/total-month')
      return response.data.data
    } catch (error: any) {
      throw error
    }
  }
)

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
        state.milkEntries = action.payload
      })
      .addCase(getAllMilk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch milk entries'
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
      
      // Get admin total
      .addCase(getAdminTotal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAdminTotal.fulfilled, (state, action) => {
        state.loading = false
        state.adminTotals = action.payload
      })
      .addCase(getAdminTotal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch admin total'
      })
      
      // Get user monthly total
      .addCase(getUserMonthly.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserMonthly.fulfilled, (state, action) => {
        state.loading = false
        state.userTotals = action.payload
      })
      .addCase(getUserMonthly.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user monthly data'
      })
      
      // Get total month
      .addCase(getTotalMonth.pending, (state) => {
        state.monthTotalsLoading = true
        state.error = null
      })
      .addCase(getTotalMonth.fulfilled, (state, action) => {
        state.monthTotalsLoading = false
        state.monthTotals = action.payload
      })
      .addCase(getTotalMonth.rejected, (state, action) => {
        state.monthTotalsLoading = false
        state.error = action.error.message || 'Failed to fetch month totals'
      })
  }
})

export const { clearError } = milkSlice.actions
export default milkSlice.reducer