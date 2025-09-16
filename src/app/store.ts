import { configureStore } from '@reduxjs/toolkit'
import slidesReducer from '../store/slidesSlice'
import preferencesReducer from '../store/preferencesSlice'

export const store = configureStore({
  reducer: {
    slides: slidesReducer,
    preferences: preferencesReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {slides: SlidesState, preferences: PreferencesState}
export type AppDispatch = typeof store.dispatch