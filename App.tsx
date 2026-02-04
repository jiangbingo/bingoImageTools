
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Cropper from 'cropperjs';
import { geminiService } from './geminiService';
import { bigmodelService } from './bigmodelService';
import { translations } from './i18n';
import { ToolType, Language, ToolConfig, ID_PHOTO_SIZES, IDPhotoSizeConfig, ToolCategory } from './types';

interface ResizePreset {
  id: string;
  label: Record<Language, string>;
  width: number;
  height: number;
}

const RESIZE_PRESETS: ResizePreset[] = [
  { id: '1in', label: { zh: '1寸', en: '1"' }, width: 295, height: 413 },
  { id: '2in', label: { zh: '2寸', en: '2"' }, width: 413, height: 579 },
  { id: 'hd', label: { zh: '720P', en: '720P' }, width: 1280, height: 720 },
  { id: 'fhd', label: { zh: '1080P', en: '1080P' }, width: 1920, height: 1080 },
  { id: 'square', label: { zh: '方形', en: '1:1' }, width: 1000, height: 1000 },
];

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

const TOOLS: ToolConfig[] = [
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

// AI 服务类型
type AIService = 'gemini' | 'bigmodel';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [activeTool, setActiveTool] = useState<ToolType>('home');
  const [currentCategory, setCurrentCategory] = useState<ToolCategory>('all');
  const [aiService, setAiService] = useState<AIService>('bigmodel');
  const [image, setImage] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const cropperRef = useRef<Cropper | null>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  const loadingSteps = useMemo(() => lang === 'zh' 
    ? ['解析图像内容...', 'AI 正在推算像素...', '优化色彩与对比度...', '准备最终成品...']
    : ['Analyzing image content...', 'AI calculating pixels...', 'Optimizing colors...', 'Finalizing result...']
  , [lang]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingSteps]);

  // Parameters
  const [targetKb, setTargetKb] = useState(100);
  const [idColor, setIdColor] = useState('white');
  const [selectedIdSize, setSelectedIdSize] = useState<IDPhotoSizeConfig>(ID_PHOTO_SIZES[1]);
  const [objectToRemove, setObjectToRemove] = useState('');
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [originalAspect, setOriginalAspect] = useState<number>(1);
  const [lockRatio, setLockRatio] = useState(true);
  
  // Format Convert Parameters
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg');
  const [convertQuality, setConvertQuality] = useState(0.92);

  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = useMemo(() => {
    if (currentCategory === 'all') return TOOLS;
    return TOOLS.filter(tool => tool.category === currentCategory);
  }, [currentCategory]);

  // Handle Cropper initialization and updates
  useEffect(() => {
    if (activeTool === 'resize' && image && previewImgRef.current && !processed) {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
      cropperRef.current = new Cropper(previewImgRef.current, {
        viewMode: 1,
        dragMode: 'move',
        aspectRatio: lockRatio ? (resizeWidth / resizeHeight) : NaN,
        autoCropArea: 0.8,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        crop(event) {
          const newW = Math.round(event.detail.width);
          const newH = Math.round(event.detail.height);
          setResizeWidth(newW);
          setResizeHeight(newH);
        },
      });
    } else {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    }
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [activeTool, image, lockRatio, processed]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImage(dataUrl);
        setProcessed(null);
        const img = new Image();
        img.onload = () => {
          setOriginalAspect(img.width / img.height);
          setResizeWidth(img.width);
          setResizeHeight(img.height);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResizeInput = (dimension: 'w' | 'h', value: number) => {
    let nextW = resizeWidth;
    let nextH = resizeHeight;

    if (dimension === 'w') {
      nextW = value;
      if (lockRatio) nextH = Math.round(value / (resizeWidth / resizeHeight || 1));
    } else {
      nextH = value;
      if (lockRatio) nextW = Math.round(value * (resizeWidth / resizeHeight || 1));
    }

    setResizeWidth(nextW);
    setResizeHeight(nextH);
    
    if (cropperRef.current) {
      const data = cropperRef.current.getData();
      cropperRef.current.setData({
        ...data,
        width: nextW,
        height: nextH,
      });
    }
  };

  const applyPreset = (preset: ResizePreset) => {
    setResizeWidth(preset.width);
    setResizeHeight(preset.height);
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(preset.width / preset.height);
      const data = cropperRef.current.getData();
      cropperRef.current.setData({
        ...data,
        width: preset.width,
        height: preset.height,
      });
    }
  };

  const handleAction = async () => {
    if (!image) return;
    setLoading(true);
    try {
      let res = '';
      // 选择 AI 服务
      const service = aiService === 'gemini' ? geminiService : bigmodelService;

      switch (activeTool) {
        case 'remove-bg': res = await service.removeBackground(image); break;
        case 'id-photo': res = await service.idPhoto(image, idColor); break;
        case 'upscale': res = await service.upscale(image); break;
        case 'compress': res = await compressImageToSize(image, targetKb); break;
        case 'resize':
          if (cropperRef.current) {
            res = cropperRef.current.getCroppedCanvas({
              width: resizeWidth,
              height: resizeHeight,
            }).toDataURL('image/png');
          } else {
            res = await performResize(image, resizeWidth, resizeHeight);
          }
          break;
        case 'restore': res = await service.restorePhoto(image); break;
        case 'remove-object': res = await service.removeObject(image, objectToRemove); break;
        case 'convert': res = await performConvert(image, targetFormat, convertQuality); break;
        case 'text-to-image':
          // 文生图仅使用 BigModel
          res = await bigmodelService.textToImage('beautiful landscape, high quality');
          break;
      }
      if (activeTool === 'id-photo') res = await cropToIdSize(res, selectedIdSize);
      setProcessed(res);
    } catch (e) {
      console.error('AI Processing Error:', e);
      alert(aiService === 'gemini' ? "Gemini Processing Failed." : "BigModel Processing Failed.");
    } finally {
      setLoading(false);
    }
  };

  const performConvert = async (dataUrl: string, format: ImageFormat, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas.toDataURL(format, quality));
      };
      img.src = dataUrl;
    });
  };

  const performResize = async (dataUrl: string, w: number, h: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
        }
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  };

  const cropToIdSize = async (dataUrl: string, size: IDPhotoSizeConfig): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size.pxWidth; canvas.height = size.pxHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = dataUrl;
    });
  };

  const compressImageToSize = async (dataUrl: string, targetSizeKb: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0);
        let quality = 0.95; let result = ''; const target = targetSizeKb * 1024;
        for (let i = 0; i < 12; i++) {
          result = canvas.toDataURL('image/jpeg', quality);
          if (Math.round((result.length * 3) / 4) <= target) break;
          quality *= 0.85;
        }
        resolve(result);
      };
      img.src = dataUrl;
    });
  };

  const reset = () => { setActiveTool('home'); setImage(null); setProcessed(null); };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-800 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black italic shadow-indigo-100 shadow-xl">B</div>
          <h1 className="text-xl font-black tracking-tighter text-indigo-900 uppercase">Bingo <span className="text-slate-400 font-medium">Tools</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setAiService('gemini')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiService === 'gemini' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Google Gemini AI"
            >Gemini</button>
            <button
              onClick={() => setAiService('bigmodel')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiService === 'bigmodel' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="智谱AI BigModel"
            >智谱AI</button>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
            <button onClick={() => setLang('zh')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'zh' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>中文</button>
            <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>EN</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTool === 'home' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">{t.heroTitle}</h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">{t.heroSub}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['all', 'optimize', 'modify', 'create', 'convert'] as ToolCategory[]).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${currentCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                  {t.categories[cat]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <div 
                  key={tool.id} 
                  onClick={() => setActiveTool(tool.id)}
                  className="group bg-white p-8 rounded-[2rem] border border-white shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-visible"
                >
                  <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner text-white`}>{tool.icon}</div>
                  <h3 className="font-extrabold text-xl text-slate-900 mb-2">{tool.translations[lang].title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{tool.translations[lang].desc}</p>
                  
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-400 pointer-events-none scale-90 group-hover:scale-100 origin-bottom">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.before}</span>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><span className="text-[10px] text-slate-400">➜</span></div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t.after}</span>
                      </div>
                      <div className="flex gap-4 h-36">
                        <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group/p">
                           <img src={tool.preview.before} className={`w-full h-full object-cover transition-all ${tool.preview.type === 'label' ? 'opacity-40 grayscale blur-[1px]' : ''}`} />
                           {tool.preview.labelBefore && (
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm text-slate-500 uppercase">{tool.preview.labelBefore}</span>
                             </div>
                           )}
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-indigo-100 relative ring-4 ring-indigo-50/50">
                           {tool.preview.type === 'grid' && <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:10px_10px] opacity-30"></div>}
                           <img src={tool.preview.after} className="w-full h-full object-cover relative z-10" />
                           {tool.preview.labelAfter && (
                             <div className="absolute inset-0 flex items-center justify-center z-20">
                               <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg uppercase">{tool.preview.labelAfter}</span>
                             </div>
                           )}
                           {tool.preview.type === 'boundary' && (
                             <div className="absolute inset-0 border-2 border-dashed border-indigo-400/60 m-4 rounded-xl z-20 animate-pulse"></div>
                           )}
                        </div>
                      </div>
                      <div className="text-[10px] text-center font-bold text-slate-400 tracking-tighter uppercase opacity-60">
                         {tool.translations[lang].desc}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 -mt-2 border-r border-b border-slate-100"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6 animate-in zoom-in-95 duration-400">
            <button onClick={reset} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.backHome}
            </button>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-white p-8 md:p-14 overflow-hidden min-h-[600px] relative">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-24 flex flex-col items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                  <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform shadow-inner">➕</div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{t.upload}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.settings}</h3>
                        <button onClick={() => {setImage(null); setProcessed(null);}} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Replace Image</button>
                      </div>
                      
                      {activeTool === 'compress' && (
                        <div className="space-y-4">
                          <label className="block text-sm font-bold text-slate-700">{t.targetSize}</label>
                          <input type="range" min="10" max="1000" step="10" value={targetKb} onChange={(e) => setTargetKb(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          <div className="flex justify-between text-xs font-black text-indigo-600">
                            <span>10 KB</span> <span className="bg-indigo-100 px-4 py-1 rounded-full">{targetKb} KB</span> <span>1 MB</span>
                          </div>
                        </div>
                      )}

                      {activeTool === 'convert' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.targetFormat}</label>
                             <div className="grid grid-cols-3 gap-2">
                               {(['image/jpeg', 'image/png', 'image/webp'] as ImageFormat[]).map(fmt => (
                                 <button 
                                  key={fmt} 
                                  onClick={() => setTargetFormat(fmt)}
                                  className={`px-2 py-3 rounded-xl border-2 transition-all text-center text-[10px] font-black ${targetFormat === fmt ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                 >
                                   {fmt.split('/')[1].toUpperCase()}
                                 </button>
                               ))}
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.quality}</label>
                             <input type="range" min="0.1" max="1" step="0.01" value={convertQuality} onChange={(e) => setConvertQuality(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                             <div className="flex justify-between text-xs font-black text-indigo-600">
                                <span>Low</span> <span className="bg-indigo-100 px-3 py-1 rounded-full">{Math.round(convertQuality * 100)}%</span> <span>High</span>
                             </div>
                          </div>
                        </div>
                      )}

                      {activeTool === 'remove-object' && (
                        <div className="space-y-4">
                           <label className="block text-sm font-bold text-slate-700">{t.removeObject}</label>
                           <textarea 
                              placeholder={t.objectHint} 
                              className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-none transition-all font-medium text-sm leading-relaxed"
                              rows={3}
                              value={objectToRemove}
                              onChange={(e) => setObjectToRemove(e.target.value)}
                           />
                        </div>
                      )}

                      {activeTool === 'resize' && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '推荐尺寸' : 'Recommended Sizes'}</label>
                             <div className="grid grid-cols-3 gap-2">
                               {RESIZE_PRESETS.map(preset => (
                                 <button 
                                  key={preset.id} 
                                  onClick={() => applyPreset(preset)}
                                  className="px-2 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black hover:border-indigo-600 hover:text-indigo-600 transition-all text-center"
                                 >
                                   {preset.label[lang]}
                                 </button>
                               ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{t.width}</label>
                              <input type="number" value={resizeWidth} onChange={(e) => handleResizeInput('w', parseInt(e.target.value) || 0)} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-mono text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{t.height}</label>
                              <input type="number" value={resizeHeight} onChange={(e) => handleResizeInput('h', parseInt(e.target.value) || 0)} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-mono text-xs" />
                            </div>
                          </div>
                          <label className="flex items-center gap-3 group cursor-pointer bg-white p-3 rounded-2xl border border-slate-200">
                            <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 transition-all" />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{t.lockRatio}</span>
                          </label>
                        </div>
                      )}

                      {activeTool === 'id-photo' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-2">
                            {ID_PHOTO_SIZES.map(size => (
                              <button key={size.id} onClick={() => setSelectedIdSize(size)} className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedIdSize.id === size.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{size.label[lang]}</button>
                            ))}
                          </div>
                          <div className="flex gap-3 p-2 bg-white rounded-2xl border border-slate-200 w-fit">
                            {['white', '#3b82f6', '#ef4444'].map(c => (
                              <button key={c} onClick={() => setIdColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${idColor === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white'}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        disabled={loading} onClick={handleAction}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                      >
                        {loading ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="group-hover:scale-110 transition-transform">🚀</span>}
                        {loading ? t.processing : t.generate}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 flex flex-col items-center justify-center">
                    <div className="relative w-full h-[500px] bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                      {processed ? (
                        <div className="w-full h-full flex items-center justify-center p-8">
                          <img src={processed} className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500 rounded-xl shadow-2xl" />
                        </div>
                      ) : (
                        <div className="w-full h-full p-4 relative flex items-center justify-center overflow-hidden">
                          <img 
                            ref={previewImgRef} 
                            src={image!} 
                            className={`max-w-full max-h-full object-contain drop-shadow-2xl ${activeTool === 'resize' ? 'invisible absolute' : ''}`} 
                          />
                          {!loading && activeTool !== 'resize' && (
                             <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl pointer-events-none z-10">{t.before}</div>
                          )}
                        </div>
                      )}
                      
                      {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-[50]">
                           <div className="flex flex-col items-center gap-6 text-center">
                              <div className="relative flex items-center justify-center">
                                <div className="w-24 h-24 border-8 border-indigo-100 rounded-full"></div>
                                <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-black text-xs">AI</div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-black text-indigo-900 uppercase tracking-tight">{t.processing}</span>
                                <span className="text-xs font-bold text-slate-400 animate-pulse px-8">{loadingSteps[loadingStep]}</span>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                    {processed && (
                      <div className="mt-10 flex gap-4">
                        <button onClick={() => { const a = document.createElement('a'); a.href = processed!; a.download = `bingo-${Date.now().toString().slice(-6)}.${targetFormat === 'image/jpeg' ? 'jpg' : targetFormat.split('/')[1]}`; a.click(); }} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-full font-black hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95">⬇️ {t.download}</button>
                        <button onClick={() => setProcessed(null)} className="px-8 py-4 rounded-full border-2 border-slate-200 text-slate-400 font-black hover:bg-slate-50 transition-all text-sm uppercase tracking-widest hover:text-indigo-600">Reset</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-16 px-6 opacity-50">
        <p className="text-slate-400 text-xs font-black tracking-[0.2em] uppercase">
          &copy; 2025 BINGO TOOLS • <span className="text-indigo-600">Professional Image Suite</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
