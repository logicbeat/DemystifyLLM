// Type definitions for the Interactive Presentation SPA

export interface Slide {
  slideIndex: number;
  slideContentGist: string;
  slideLabUrl?: string | string[];
}

export interface SlideWithContent extends Slide {
  content?: string;
  title?: string;
  description?: string;
  isContentLoaded?: boolean;
  contentError?: string;
}

export interface PresentationMetadata {
  title?: string;
  author?: string;
  description?: string;
}

export interface PresentationData {
  slides: Slide[];
  metadata?: PresentationMetadata;
}

export type ControlBarPosition = 'top' | 'bottom' | 'left' | 'right';
export type Theme = 'light' | 'dark';

export interface UserPreferences {
  controlBarPosition: ControlBarPosition;
  theme: Theme;
  wrapNavigation: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}