import { configureStore } from "@reduxjs/toolkit";
import meeSlicer from "./slices/meeSlicer"
import siteSettingsSlice from "./slices/sitesettingSlicer"
import monthSlice from "./slices/monthslicer"
import userSlicer from "./slices/userSlicer"
import milkSlicer from "./slices/milkSlicer"


const store = configureStore({
  reducer: {
    mee: meeSlicer,
    user: userSlicer,
    siteSettings: siteSettingsSlice,
    months: monthSlice,
    milk: milkSlicer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;