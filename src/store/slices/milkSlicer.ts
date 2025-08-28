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
}

export interface AdminTotal {
  _id: string
  monthid: string
  totalMilk: number
  totalMoney: number
}

interface MilkState {
  milkEntries: MilkEntry[]
  userTotals: UserTotal[]

  adminTotal: AdminTotal | null
  loading: boolean
  saveLoading: boolean
  error: string | null
}

const initialState: MilkState = {
  milkEntries: [],
  userTotals: [],
  adminTotal: null,
  loading: false,
  saveLoading: false,
  error: null
}

// Save milk entry
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
      // Fallback mock data for development
      const mockResponse = {
        daily: {
          _id: Date.now().toString(),
          userid: milkData.userid,
          name: milkData.name,
          todaymilk: milkData.todaymilk,
          todaymoney: milkData.todaymoney,
          todayfit: milkData.todayfit,
          monthid: 'mock-month-id',
          createdAt: new Date().toISOString()
        },
        userTotal: {
          _id: `user-total-${milkData.userid}`,
          userid: milkData.userid,
          name: milkData.name,
          totalMilk: milkData.todaymilk,
          totalMoney: milkData.todaymoney,
          monthid: 'mock-month-id'
        },
        adminTotal: {
          _id: 'admin-total-mock',
          monthid: 'mock-month-id',
          totalMilk: milkData.todaymilk,
          totalMoney: milkData.todaymoney
        }
      }
      return mockResponse
    }
  }
)

// Get milk entries for today
export const getTodayMilkEntries = createAsyncThunk(
  'milk/getTodayEntries',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/today')
      return response.data.data
    } catch (error: any) {
      return []
    }
  }
)




// Fetch all milk entries
export const fetchAllMilkEntries = createAsyncThunk(
  'milk/fetchAllEntries',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/allmilk')
      return response.data.data
    } catch (error: any) {
      return []
    }
  }
)
// Get user totals for current month
export const getUserTotals = createAsyncThunk(
  'milk/getUserTotals',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/user-totals')
      return response.data.data
    } catch (error: any) {
      return []
    }
  }
)

// Get admin total for current month
export const getAdminTotal = createAsyncThunk(
  'milk/getAdminTotal',
  async () => {
    try {
      const response = await axiosInstance.get('/milk/admin-total')
      return response.data.data
    } catch (error: any) {
      return null
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
        
        // Update admin total
        state.adminTotal = action.payload.adminTotal
      })
      .addCase(saveMilk.rejected, (state, action) => {
        state.saveLoading = false
        state.error = action.error.message || 'Failed to save milk entry'
      })
      
      // Get today's entries
      .addCase(getTodayMilkEntries.pending, (state) => {
        state.loading = true
      })
      .addCase(getTodayMilkEntries.fulfilled, (state, action) => {
        state.loading = false
        state.milkEntries = action.payload
      })
      .addCase(getTodayMilkEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch milk entries'
      })
      
    
      // Get user totals
      .addCase(getUserTotals.fulfilled, (state, action) => {
        state.userTotals = action.payload
      })
      
      // Fetch all milk entries
      .addCase(fetchAllMilkEntries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllMilkEntries.fulfilled, (state, action) => {
        state.loading = false
        state.milkEntries = action.payload
      })
      .addCase(fetchAllMilkEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch all milk entries'
      })

      // Get admin total
      .addCase(getAdminTotal.fulfilled, (state, action) => {
        state.adminTotal = action.payload
      })
  }
})

export const { clearError } = milkSlice.actions
export default milkSlice.reducer