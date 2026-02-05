import { ToolConfig, Language } from '../../types';
import { translations } from '../../i18n';

interface ToolCardProps {
  tool: ToolConfig;
  lang: Language;
  onClick: () => void;
}

export function ToolCard({ tool, lang, onClick }: ToolCardProps) {
  const t = translations[lang];

  return (
    <div
      onClick={onClick}
      className="group bg-white p-8 rounded-[2rem] border border-white shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-visible"
    >
      <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner text-white`}>
        {tool.icon}
      </div>
      <h3 className="font-extrabold text-xl text-slate-900 mb-2">
        {tool.translations[lang].title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">
        {tool.translations[lang].desc}
      </p>

      {/* Preview Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-400 pointer-events-none scale-90 group-hover:scale-100 origin-bottom">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.before}</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-[10px] text-slate-400">➜</span>
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t.after}</span>
          </div>
          <div className="flex gap-4 h-36">
            <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group/p">
              <img
                src={tool.preview.before}
                className={`w-full h-full object-cover transition-all ${
                  tool.preview.type === 'label' ? 'opacity-40 grayscale blur-[1px]' : ''
                }`}
                alt="Before"
              />
              {tool.preview.labelBefore && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm text-slate-500 uppercase">
                    {tool.preview.labelBefore}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-indigo-100 relative ring-4 ring-indigo-50/50">
              {tool.preview.type === 'grid' && (
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:10px_10px] opacity-30"></div>
              )}
              <img
                src={tool.preview.after}
                className="w-full h-full object-cover relative z-10"
                alt="After"
              />
              {tool.preview.labelAfter && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg uppercase">
                    {tool.preview.labelAfter}
                  </span>
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
  );
}
