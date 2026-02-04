
export type Language = 'zh' | 'en';

export type ToolCategory = 'all' | 'optimize' | 'create' | 'modify' | 'convert';

export type ToolType = 
  | 'home'
  | 'id-photo' 
  | 'compress' 
  | 'upscale' 
  | 'remove-bg' 
  | 'meme' 
  | 'editor' 
  | 'resize' 
  | 'convert'
  | 'text-to-image'
  | 'restore'
  | 'remove-object';

export interface Translation {
  title: string;
  desc: string;
}

export interface PreviewData {
  before: string;
  after: string;
  type: 'image' | 'label' | 'boundary' | 'grid';
  labelBefore?: string;
  labelAfter?: string;
}

export interface ToolConfig {
  id: ToolType;
  icon: string;
  color: string;
  category: Exclude<ToolCategory, 'all'>;
  translations: Record<Language, Translation>;
  preview: PreviewData;
}

export interface IDPhotoSizeConfig {
  id: string;
  label: Record<Language, string>;
  widthMm: number;
  heightMm: number;
  pxWidth: number;
  pxHeight: number;
}

export const ID_PHOTO_SIZES: IDPhotoSizeConfig[] = [
  { id: '1in_s', label: { zh: '小1寸', en: 'Small 1"' }, widthMm: 22, heightMm: 32, pxWidth: 260, pxHeight: 378 },
  { id: '1in', label: { zh: '1寸', en: '1"' }, widthMm: 25, heightMm: 35, pxWidth: 295, pxHeight: 413 },
  { id: '2in_s', label: { zh: '小2寸', en: 'Small 2"' }, widthMm: 33, heightMm: 48, pxWidth: 390, pxHeight: 567 },
  { id: '2in', label: { zh: '2寸', en: '2"' }, widthMm: 35, heightMm: 49, pxWidth: 413, pxHeight: 579 },
  { id: 'passport', label: { zh: '护照/大2寸', en: 'Passport' }, widthMm: 35, heightMm: 45, pxWidth: 413, pxHeight: 531 },
  { id: 'visa_us', label: { zh: '美国签证', en: 'US Visa' }, widthMm: 51, heightMm: 51, pxWidth: 600, pxHeight: 600 },
];
