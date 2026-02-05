import { Language } from '../types';

export interface ResizePreset {
  id: string;
  label: Record<Language, string>;
  width: number;
  height: number;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { id: '1in', label: { zh: '1寸', en: '1"' }, width: 295, height: 413 },
  { id: '2in', label: { zh: '2寸', en: '2"' }, width: 413, height: 579 },
  { id: 'hd', label: { zh: '720P', en: '720P' }, width: 1280, height: 720 },
  { id: 'fhd', label: { zh: '1080P', en: '1080P' }, width: 1920, height: 1080 },
  { id: 'square', label: { zh: '方形', en: '1:1' }, width: 1000, height: 1000 },
];
