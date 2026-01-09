import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAMILIES = [
  { id: "ha", name: "Họ Hà - Hà Đông" },
  { id: "tran", name: "Họ Trần - Nam Định" },
  { id: "dao", name: "Họ Đào - Bắc Ninh" },
  { id: "ngoai", name: "Họ Ông Ngoại" },
];

const FamilyBanner = () => {
  const [selectedFamily, setSelectedFamily] = useState(FAMILIES[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-48 bg-stone-900 rounded-b-3xl shadow-2xl overflow-hidden mb-6 group">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      {/* Glowing Accents */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-red-900/20 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
        <h2 className="text-amber-500 text-xs tracking-[0.3em] uppercase mb-2 font-bold animate-pulse">
          Gia Phả Dòng Tộc
        </h2>

        {/* Family Selector */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 text-3xl md:text-4xl font-serif font-bold text-white hover:text-amber-100 transition-colors"
          >
            <span>{selectedFamily.name}</span>
            <ChevronDown
              size={24}
              className={`text-amber-500 transition-transform duration-300 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-stone-800/95 backdrop-blur-md border border-stone-700 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {FAMILIES.map((family) => (
                <button
                  key={family.id}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between
                    ${
                      selectedFamily.id === family.id
                        ? "bg-amber-900/30 text-amber-400"
                        : "text-stone-300 hover:bg-stone-700 hover:text-white"
                    }`}
                  onClick={() => {
                    setSelectedFamily(family);
                    setIsMenuOpen(false);
                  }}
                >
                  {family.name}
                  {selectedFamily.id === family.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-stone-400 text-sm mt-4 font-light max-w-md mx-auto leading-relaxed">
          &quot;Cây có gốc mới nở cành xanh ngọn, Nước có nguồn mới bể rộng sông
          sâu.&quot;
        </p>
      </div>
    </div>
  );
};

export default FamilyBanner;
