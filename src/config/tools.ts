import { ToolConfig } from '../types';

export const TOOLS: ToolConfig[] = [
  {
    id: 'compress', icon: '📉', color: 'bg-blue-500', category: 'optimize',
    translations: { zh: { title: '压缩图片', desc: '极速减小体积并保持清晰' }, en: { title: 'Compress', desc: 'Reduce size while keeping quality' } },
    preview: {
      type: 'label',
      before: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop&q=80',
      after: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop&q=10',
      labelBefore: '2.4 MB', labelAfter: '180 KB'
    }
  },
  {
    id: 'upscale', icon: '✨', color: 'bg-indigo-500', category: 'optimize',
    translations: { zh: { title: 'AI 放大', desc: '智能填补细节，超清重构' }, en: { title: 'Upscale', desc: 'Enhance resolution and clarity' } },
    preview: {
      type: 'image',
      before: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=60&h=60&fit=crop',
      after: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop'
    }
  },
  {
    id: 'restore', icon: '🕰️', color: 'bg-amber-600', category: 'optimize',
    translations: { zh: { title: '老照片修复', desc: '划痕消除、上色、画质重塑' }, en: { title: 'Restoration', desc: 'Fix scratches, blur and colorize' } },
    preview: {
      type: 'image',
      before: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop&sepia=1&blur=5&auto=format&q=20',
      after: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop&auto=format&q=80'
    }
  },
  {
    id: 'remove-bg', icon: '✂️', color: 'bg-red-500', category: 'modify',
    translations: { zh: { title: '去除背景', desc: '发丝级抠图，支持复杂背景' }, en: { title: 'Remove BG', desc: 'AI-powered background removal' } },
    preview: {
      type: 'grid',
      before: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      after: 'https://img.icons8.com/plasticine/200/person-male.png'
    }
  },
  {
    id: 'remove-object', icon: '🪄', color: 'bg-orange-500', category: 'modify',
    translations: { zh: { title: '魔术消除', desc: '路人、水印、杂物无痕涂抹' }, en: { title: 'Magic Eraser', desc: 'Remove objects or watermarks' } },
    preview: {
      type: 'image',
      before: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&txt=WATERMARK&txt-size=50&txt-color=88ffffff&txt-align=center',
      after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop'
    }
  },
  {
    id: 'id-photo', icon: '👤', color: 'bg-teal-500', category: 'create',
    translations: { zh: { title: '证件照', desc: '全规格支持，智能排版美颜' }, en: { title: 'ID Photo', desc: 'Create professional ID photos' } },
    preview: {
      type: 'image',
      before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      after: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&bg=fff'
    }
  },
  {
    id: 'resize', icon: '📏', color: 'bg-purple-500', category: 'modify',
    translations: { zh: { title: '调整大小', desc: '精确像素控制，支持自由裁剪' }, en: { title: 'Resize & Crop', desc: 'Pixel control and free cropping' } },
    preview: {
      type: 'boundary',
      before: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=200&fit=crop',
      after: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=200&fit=crop',
      labelBefore: 'Original Size', labelAfter: 'Selected Area'
    }
  },
  {
    id: 'convert', icon: '🔄', color: 'bg-emerald-500', category: 'convert',
    translations: { zh: { title: '格式转换', desc: '支持 JPG/PNG/WebP 互相转换' }, en: { title: 'Converter', desc: 'Convert between JPG/PNG/WebP' } },
    preview: {
      type: 'label',
      before: 'https://img.icons8.com/color/200/png.png',
      after: 'https://img.icons8.com/color/200/jpg.png',
      labelBefore: 'PNG', labelAfter: 'JPG'
    }
  },
  {
    id: 'text-to-image', icon: '🎨', color: 'bg-pink-500', category: 'create',
    translations: { zh: { title: '文生图', desc: '想象力变现，支持多种画风' }, en: { title: 'AI Artist', desc: 'Generate images from text' } },
    preview: {
      type: 'image',
      before: 'https://img.icons8.com/fluency/200/pencil.png',
      after: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop'
    }
  },
];
