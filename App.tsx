
import React, { useState } from 'react';
import { Shirt, Image as ImageIcon, Sparkles, Loader2, Download, History, ArrowRight, User, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GarmentType, MockupResult, GenerationState } from './types';
import { generateAOPMockup } from './geminiService';

const GARMENT_TYPES: GarmentType[] = ['T-shirt', 'Tank top', 'Polo Shirt', 'Hoodie'];

const App: React.FC = () => {
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>('T-shirt');
  const [patternImage, setPatternImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [modelDescription, setModelDescription] = useState<string>('');
  const [history, setHistory] = useState<MockupResult[]>([]);
  const [generation, setGeneration] = useState<GenerationState>({
    isGenerating: false,
    status: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMockup = async () => {
    if (!patternImage) return;

    const statusMsg = modelImage 
      ? 'FUSIONANDO: Mapeando estampa no corpo da pessoa...' 
      : 'CRIANDO: Gerando modelo profissional com sua estampa...';

    setGeneration({ isGenerating: true, status: statusMsg });
    
    try {
      const { flatImage, modelImage: resultModelImage } = await generateAOPMockup(
        patternImage, 
        selectedGarment, 
        modelDescription,
        modelImage
      );
      
      const newResult: MockupResult = {
        id: Math.random().toString(36).substr(2, 9),
        garmentType: selectedGarment,
        flatImageUrl: flatImage,
        modelImageUrl: resultModelImage,
        patternUrl: patternImage,
        timestamp: Date.now(),
      };

      setHistory(prev => [newResult, ...prev]);
      setGeneration({ isGenerating: false, status: '' });
      
      setTimeout(() => {
        document.getElementById('latest-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error(error);
      setGeneration({ 
        isGenerating: false, 
        status: '', 
        error: 'A fusão falhou. Tente uma foto da pessoa com iluminação mais clara e sem objetos cobrindo a roupa.' 
      });
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Shirt className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                AOP <span className="text-indigo-600">FASHION</span> MOCKUP
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advanced Pattern Fusion Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">GEMINI AI ACTIVE</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Pattern Upload */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wide">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  1. Desenho da Estampa
                </h2>
                {patternImage && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-2 transition-all hover:border-indigo-400 hover:bg-indigo-50/20">
                {patternImage ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-inner bg-slate-100">
                    <img src={patternImage} alt="Pattern Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setPatternImage(null)}
                      className="absolute top-3 right-3 bg-white/95 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square cursor-pointer text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">Upload da Estampa</span>
                    <span className="text-[10px] mt-1 opacity-60">PNG ou JPG (Alta Resolução)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setPatternImage)} />
                  </label>
                )}
              </div>
            </section>

            {/* 2. Model Image Upload - THE FUSION CORE */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3">
                  <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    FUSION MODE
                  </div>
               </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wide">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  2. Foto da Pessoa
                </h2>
                {modelImage && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-2 transition-all hover:border-emerald-400 hover:bg-emerald-50/20">
                {modelImage ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-inner bg-slate-100">
                    <img src={modelImage} alt="Model Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setModelImage(null)}
                      className="absolute top-3 right-3 bg-white/95 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square cursor-pointer text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 opacity-40" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">Quem vai usar?</span>
                    <span className="text-[10px] mt-1 opacity-60 text-center px-4">Upload da foto para "vestir" a estampa</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setModelImage)} />
                  </label>
                )}
              </div>
              {!modelImage && (
                <p className="mt-3 text-[10px] text-slate-400 italic text-center leading-relaxed">
                  Se vazio, criaremos um modelo digital perfeito para sua estampa.
                </p>
              )}
            </section>

            {/* 3. Garment Selection */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-wide">
                <Shirt className="w-4 h-4 text-indigo-600" />
                3. Tipo de Roupa
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {GARMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedGarment(type)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                      selectedGarment === type 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. Model Description */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-violet-600" />
                4. Detalhes da Foto
              </h2>
              <textarea
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                placeholder="Ex: Pose de editorial, fundo de estúdio, estilo urbano..."
                className="w-full h-24 p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-medium placeholder:text-slate-300"
              />
            </section>

            <button
              onClick={generateMockup}
              disabled={!patternImage || generation.isGenerating}
              className={`w-full py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl uppercase tracking-widest ${
                !patternImage || generation.isGenerating
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white hover:opacity-90 active:scale-95 shadow-indigo-200'
              }`}
            >
              {generation.isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PROCESSANDO...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  GERAR FUSÃO REALISTA
                </>
              )}
            </button>

            {generation.error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[11px] font-bold text-red-600 leading-tight italic">{generation.error}</p>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            {generation.isGenerating ? (
              <div className="bg-white rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[650px] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 overflow-hidden">
                   <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out_infinite]" style={{width: '30%'}} />
                </div>
                <div className="relative">
                  <div className="w-40 h-40 border-8 border-slate-50 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl animate-pulse ring-4 ring-white">
                       <img src={patternImage!} className="w-full h-full object-cover opacity-80" />
                       <div className="absolute inset-0 bg-indigo-600/20 mix-blend-overlay" />
                       <Shirt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 max-w-sm">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Mapeando Tecido...</h3>
                  <p className="text-slate-400 text-sm font-bold tracking-widest uppercase leading-relaxed">{generation.status}</p>
                  <div className="flex justify-center gap-1.5 pt-4">
                     {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                  </div>
                </div>
              </div>
            ) : history.length > 0 ? (
              <div id="latest-result" className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[30px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black italic">!</div>
                       <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Design Concluído</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        {history[0].garmentType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Flat Product */}
                    <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 group transition-all hover:scale-[1.02]">
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Shirt className="w-4 h-4" /> Produto Final
                        </span>
                        <button 
                          onClick={() => downloadImage(history[0].flatImageUrl, `garment-${history[0].id}`)}
                          className="bg-white p-2.5 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all active:scale-90"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="aspect-square bg-white flex items-center justify-center p-12 overflow-hidden relative">
                        <img 
                          src={history[0].flatImageUrl} 
                          alt="Flat Mockup" 
                          className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110 drop-shadow-2xl" 
                        />
                      </div>
                    </div>

                    {/* Human Model Fusion */}
                    <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 group transition-all hover:scale-[1.02] ring-[12px] ring-indigo-50/50">
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-indigo-600">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                          <User className="w-4 h-4" /> Editorial de Moda
                        </span>
                        <button 
                          onClick={() => downloadImage(history[0].modelImageUrl, `editorial-${history[0].id}`)}
                          className="bg-white/20 p-2.5 rounded-2xl text-white hover:bg-white/40 backdrop-blur-md transition-all active:scale-90"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="aspect-[3/4] overflow-hidden bg-slate-900 relative">
                        <img 
                          src={history[0].modelImageUrl} 
                          alt="Model Mockup" 
                          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                        />
                        <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20">
                           <p className="text-[9px] font-black text-white uppercase tracking-widest">AOP Neural Fusion</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History */}
                {history.length > 1 && (
                  <section id="history" className="pt-16 border-t border-slate-200">
                    <div className="flex items-center gap-4 mb-8">
                       <History className="w-6 h-6 text-slate-300" />
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Galeria de Criações</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {history.slice(1).map((item) => (
                        <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                          <img src={item.modelImageUrl} className="aspect-[3/4] object-cover" />
                          <div className="absolute inset-0 bg-indigo-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                            <span className="text-white text-[10px] font-black mb-3 uppercase tracking-widest border-b border-white/30 pb-1">{item.garmentType}</span>
                            <button 
                              onClick={() => downloadImage(item.modelImageUrl, `history-${item.id}`)}
                              className="bg-white text-indigo-900 p-3 rounded-2xl shadow-xl transition-all active:scale-90"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-16 flex flex-col items-center justify-center text-center space-y-8 min-h-[650px] border border-dashed border-slate-300 group">
                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="text-indigo-600 w-12 h-12 opacity-30" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Seu Ateliê Virtual</h3>
                  <p className="text-slate-400 max-w-sm leading-relaxed font-medium mx-auto text-sm">
                    Envie sua estampa e a foto da pessoa. <br/>
                    Nossa IA vai <span className="text-indigo-600 font-bold">fusionar</span> o tecido perfeitamente no corpo.
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-6 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                   <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase">Design</span>
                   </div>
                   <div className="h-0.5 w-8 bg-slate-200" />
                   <div className="flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase">Pessoa</span>
                   </div>
                   <div className="h-0.5 w-8 bg-slate-200" />
                   <div className="flex flex-col items-center gap-1 text-indigo-600">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Fusão</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;
