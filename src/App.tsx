import React, { useState, useRef, useMemo, useEffect } from 'react';
import Cropper from 'cropperjs';
import { bigmodelService } from './services/bigmodelService';
import { ToolType, Language, ID_PHOTO_SIZES, IDPhotoSizeConfig, ToolCategory } from './types';
import { logger } from './utils/logger';
import { compressImageToSize, performConvert, performResize, cropToIdSize, ImageFormat } from './utils/image';
import { translations } from './i18n';
import { TOOLS } from './config/tools';
import { RESIZE_PRESETS } from './config/resizePresets';
import { Header } from './components/Header/Header';
import { ToolCard } from './components/ToolCard/ToolCard';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { Footer } from './components/Footer/Footer';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [activeTool, setActiveTool] = useState<ToolType>('home');
  const [currentCategory, setCurrentCategory] = useState<ToolCategory>('all');
  const [image, setImage] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const cropperRef = useRef<Cropper | null>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

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

  // Loading steps animation
  const loadingSteps = useMemo(() =>
    lang === 'zh'
      ? ['解析图像内容...', 'AI 正在推算像素...', '优化色彩与对比度...', '准备最终成品...']
      : ['Analyzing image content...', 'AI calculating pixels...', 'Optimizing colors...', 'Finalizing result...']
  , [lang]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingSteps.length]);

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

  const applyPreset = (preset: typeof RESIZE_PRESETS[0]) => {
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

      switch (activeTool) {
        case 'remove-bg': res = await bigmodelService.removeBackground(image); break;
        case 'id-photo': res = await bigmodelService.idPhoto(image, idColor); break;
        case 'upscale': res = await bigmodelService.upscale(image); break;
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
        case 'restore': res = await bigmodelService.restorePhoto(image); break;
        case 'remove-object': res = await bigmodelService.removeObject(image, objectToRemove); break;
        case 'convert': res = await performConvert(image, targetFormat, convertQuality); break;
        case 'text-to-image':
          res = await bigmodelService.textToImage('beautiful landscape, high quality');
          break;
      }
      if (activeTool === 'id-photo') res = await cropToIdSize(res, selectedIdSize);
      setProcessed(res);
    } catch (e) {
      logger.error('AI Processing Error:', e);
      alert(`Processing Failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setActiveTool('home'); setImage(null); setProcessed(null); };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-800 font-sans">
      <Header lang={lang} onLangChange={setLang} onReset={reset} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTool === 'home' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                {t.heroTitle}
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                {t.heroSub}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['all', 'optimize', 'modify', 'create', 'convert'] as ToolCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    currentCategory === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {t.categories[cat]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  lang={lang}
                  onClick={() => setActiveTool(tool.id)}
                />
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
                  <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform shadow-inner">
                    ➕
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{t.upload}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {t.settings}
                        </h3>
                        <button onClick={() => {setImage(null); setProcessed(null);}} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">
                          Replace Image
                        </button>
                      </div>

                      {activeTool === 'compress' && (
                        <div className="space-y-4">
                          <label className="block text-sm font-bold text-slate-700">{t.targetSize}</label>
                          <input
                            type="range"
                            min="10"
                            max="1000"
                            step="10"
                            value={targetKb}
                            onChange={(e) => setTargetKb(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="flex justify-between text-xs font-black text-indigo-600">
                            <span>10 KB</span>
                            <span className="bg-indigo-100 px-4 py-1 rounded-full">{targetKb} KB</span>
                            <span>1 MB</span>
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
                                  className={`px-2 py-3 rounded-xl border-2 transition-all text-center text-[10px] font-black ${
                                    targetFormat === fmt
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                  }`}
                                >
                                  {fmt.split('/')[1].toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.quality}</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.01"
                              value={convertQuality}
                              onChange={(e) => setConvertQuality(parseFloat(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs font-black text-indigo-600">
                              <span>Low</span>
                              <span className="bg-indigo-100 px-3 py-1 rounded-full">{Math.round(convertQuality * 100)}%</span>
                              <span>High</span>
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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {lang === 'zh' ? '推荐尺寸' : 'Recommended Sizes'}
                            </label>
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
                              <input
                                type="number"
                                value={resizeWidth}
                                onChange={(e) => handleResizeInput('w', parseInt(e.target.value) || 0)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{t.height}</label>
                              <input
                                type="number"
                                value={resizeHeight}
                                onChange={(e) => handleResizeInput('h', parseInt(e.target.value) || 0)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-mono text-xs"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-3 group cursor-pointer bg-white p-3 rounded-2xl border border-slate-200">
                            <input
                              type="checkbox"
                              checked={lockRatio}
                              onChange={(e) => setLockRatio(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 transition-all"
                            />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{t.lockRatio}</span>
                          </label>
                        </div>
                      )}

                      {activeTool === 'id-photo' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-2">
                            {ID_PHOTO_SIZES.map(size => (
                              <button
                                key={size.id}
                                onClick={() => setSelectedIdSize(size)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${
                                  selectedIdSize.id === size.id
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                }`}
                              >
                                {size.label[lang]}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-3 p-2 bg-white rounded-2xl border border-slate-200 w-fit">
                            {['white', '#3b82f6', '#ef4444'].map(c => (
                              <button
                                key={c}
                                onClick={() => setIdColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  idColor === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        disabled={loading}
                        onClick={handleAction}
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
                          <img
                            src={processed}
                            className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500 rounded-xl shadow-2xl"
                            alt="Processed"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full p-4 relative flex items-center justify-center overflow-hidden">
                          <img
                            ref={previewImgRef}
                            src={image!}
                            className={`max-w-full max-h-full object-contain drop-shadow-2xl ${
                              activeTool === 'resize' ? 'invisible absolute' : ''
                            }`}
                            alt="Preview"
                          />
                          {!loading && activeTool !== 'resize' && (
                            <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl pointer-events-none z-10">
                              {t.before}
                            </div>
                          )}
                        </div>
                      )}

                      {loading && <LoadingSpinner lang={lang} currentStep={loadingStep} />}
                    </div>
                    {processed && (
                      <div className="mt-10 flex gap-4">
                        <button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = processed!;
                            a.download = `bingo-${Date.now().toString().slice(-6)}.${targetFormat === 'image/jpeg' ? 'jpg' : targetFormat.split('/')[1]}`;
                            a.click();
                          }}
                          className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-full font-black hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95"
                        >
                          ⬇️ {t.download}
                        </button>
                        <button
                          onClick={() => setProcessed(null)}
                          className="px-8 py-4 rounded-full border-2 border-slate-200 text-slate-400 font-black hover:bg-slate-50 transition-all text-sm uppercase tracking-widest hover:text-indigo-600"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
