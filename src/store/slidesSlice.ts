import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Slide, PresentationMetadata, LoadingState } from '../types';

interface SlidesState {
  slides: Slide[];
  currentSlideIndex: number;
  metadata: PresentationMetadata | null;
  loading: LoadingState;
  gistUrl: string | null;
}

const initialState: SlidesState = {
  slides: [],
  currentSlideIndex: 0,
  metadata: null,
  loading: {
    isLoading: false,
    error: null,
  },
  gistUrl: null,
};

const slidesSlice = createSlice({
  name: 'slides',
  initialState,
  reducers: {
    setGistUrl: (state, action: PayloadAction<string>) => {
      state.gistUrl = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isLoading = action.payload;
      if (action.payload) {
        state.loading.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading.error = action.payload;
      state.loading.isLoading = false;
    },
    setSlidesData: (state, action: PayloadAction<{ slides: Slide[]; metadata?: PresentationMetadata }>) => {
      state.slides = action.payload.slides;
      state.metadata = action.payload.metadata || null;
      state.loading.isLoading = false;
      state.loading.error = null;
      // Reset to first slide when new data is loaded
      state.currentSlideIndex = 0;
    },
    setCurrentSlide: (state, action: PayloadAction<number>) => {
      const slideIndex = action.payload;
      if (slideIndex >= 0 && slideIndex < state.slides.length) {
        state.currentSlideIndex = slideIndex;
      }
    },
    nextSlide: (state) => {
      if (state.currentSlideIndex < state.slides.length - 1) {
        state.currentSlideIndex += 1;
      }
    },
    previousSlide: (state) => {
      if (state.currentSlideIndex > 0) {
        state.currentSlideIndex -= 1;
      }
    },
    firstSlide: (state) => {
      state.currentSlideIndex = 0;
    },
    lastSlide: (state) => {
      if (state.slides.length > 0) {
        state.currentSlideIndex = state.slides.length - 1;
      }
    },
  },
});

export const {
  setGistUrl,
  setLoading,
  setError,
  setSlidesData,
  setCurrentSlide,
  nextSlide,
  previousSlide,
  firstSlide,
  lastSlide,
} = slidesSlice.actions;

export default slidesSlice.reducer;