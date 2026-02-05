import { Language } from '../../types';
import { translations } from '../../i18n';

interface LoadingSpinnerProps {
  lang: Language;
  currentStep: number;
}

export function LoadingSpinner({ lang, currentStep }: LoadingSpinnerProps) {
  const t = translations[lang];

  const loadingSteps = lang === 'zh'
    ? ['解析图像内容...', 'AI 正在推算像素...', '优化色彩与对比度...', '准备最终成品...']
    : ['Analyzing image content...', 'AI calculating pixels...', 'Optimizing colors...', 'Finalizing result...'];

  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-[50]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-8 border-indigo-100 rounded-full"></div>
          <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-black text-xs">
            AI
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-black text-indigo-900 uppercase tracking-tight">{t.processing}</span>
          <span className="text-xs font-bold text-slate-400 animate-pulse px-8">
            {loadingSteps[currentStep]}
          </span>
        </div>
      </div>
    </div>
  );
}
