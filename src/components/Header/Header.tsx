import { Language } from '../../types';
import { translations } from '../../i18n';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  onReset: () => void;
}

export function Header({ lang, onLangChange, onReset }: HeaderProps) {
  const t = translations[lang];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black italic shadow-indigo-100 shadow-xl">
          B
        </div>
        <h1 className="text-xl font-black tracking-tighter text-indigo-900 uppercase">
          Bingo <span className="text-slate-400 font-medium">Tools</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* 语言选择 */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
          <button
            onClick={() => onLangChange('zh')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              lang === 'zh' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => onLangChange('en')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              lang === 'en' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </nav>
  );
}
