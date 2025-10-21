// This component provides SVG illustrations similar to the reference image

export const WomanWithBasket = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Woman in saree with basket */}
    <defs>
      <linearGradient id="sareeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
    </defs>
    
    {/* Body */}
    <ellipse cx="100" cy="140" rx="35" ry="50" fill="url(#sareeGradient)" />
    
    {/* Saree pallu */}
    <path d="M 70 120 Q 65 110 75 100 L 85 140" fill="#fbbf24" opacity="0.8" />
    
    {/* Arms */}
    <ellipse cx="70" cy="110" rx="8" ry="25" fill="#fbbf24" transform="rotate(-20 70 110)" />
    <ellipse cx="130" cy="110" rx="8" ry="25" fill="#fbbf24" transform="rotate(20 130 110)" />
    
    {/* Basket */}
    <rect x="120" y="130" width="30" height="25" rx="5" fill="#d97706" />
    <ellipse cx="135" cy="130" rx="15" ry="8" fill="#b45309" />
    {/* Basket items */}
    <circle cx="125" cy="135" r="4" fill="#dc2626" />
    <circle cx="135" cy="137" r="4" fill="#16a34a" />
    <circle cx="143" cy="135" r="4" fill="#ea580c" />
    
    {/* Neck */}
    <rect x="92" y="75" width="16" height="15" fill="#fbbf24" />
    
    {/* Head */}
    <circle cx="100" cy="65" r="22" fill="#fcd34d" />
    
    {/* Hair */}
    <ellipse cx="100" cy="55" rx="23" ry="18" fill="#0f172a" />
    <path d="M 78 65 Q 75 80 85 85" fill="#0f172a" />
    <circle cx="110" cy="72" r="8" fill="#0f172a" /> {/* Hair bun */}
    
    {/* Face features */}
    <circle cx="93" cy="63" r="2" fill="#0f172a" /> {/* Left eye */}
    <path d="M 91 62 Q 93 60 95 62" stroke="#0f172a" strokeWidth="1" fill="none" /> {/* Left eyebrow */}
    <circle cx="107" cy="63" r="2" fill="#0f172a" /> {/* Right eye */}
    <path d="M 105 62 Q 107 60 109 62" stroke="#0f172a" strokeWidth="1" fill="none" /> {/* Right eyebrow */}
    <path d="M 96 73 Q 100 76 104 73" stroke="#0f172a" strokeWidth="1.5" fill="none" /> {/* Smile */}
    <circle cx="108" cy="68" r="3" fill="#fb7185" opacity="0.5" /> {/* Blush */}
    
    {/* Bindi */}
    <circle cx="100" cy="58" r="2" fill="#dc2626" />
    
    {/* Jewelry */}
    <circle cx="80" cy="65" r="4" fill="#fbbf24" /> {/* Left earring */}
    <circle cx="120" cy="65" r="4" fill="#fbbf24" /> {/* Right earring */}
    <ellipse cx="100" cy="80" rx="12" ry="3" fill="#fbbf24" /> {/* Necklace */}
    
    {/* Bangles */}
    <circle cx="70" cy="125" r="3" fill="#dc2626" opacity="0.8" />
    <circle cx="70" cy="130" r="3" fill="#fbbf24" opacity="0.8" />
  </svg>
);

export const WomanTailoring = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    
    {/* Sewing machine */}
    <rect x="110" y="120" width="50" height="30" rx="3" fill="#475569" />
    <circle cx="135" cy="110" r="12" fill="#64748b" />
    <rect x="125" y="145" width="20" height="8" fill="#334155" />
    
    {/* Table */}
    <rect x="90" y="145" width="90" height="5" fill="#92400e" />
    
    {/* Fabric on table */}
    <path d="M 95 140 Q 110 135 125 140" fill="#ec4899" opacity="0.7" />
    
    {/* Body */}
    <ellipse cx="80" cy="130" rx="30" ry="45" fill="url(#blueGradient)" />
    
    {/* Arms */}
    <ellipse cx="60" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(-15 60 115)" />
    <ellipse cx="100" cy="120" rx="8" ry="20" fill="#fcd34d" transform="rotate(25 100 120)" />
    
    {/* Hand working */}
    <circle cx="105" cy="135" r="6" fill="#fbbf24" />
    
    {/* Neck */}
    <rect x="72" y="70" width="16" height="12" fill="#fcd34d" />
    
    {/* Head */}
    <circle cx="80" cy="60" r="20" fill="#fcd34d" />
    
    {/* Hair */}
    <ellipse cx="80" cy="50" rx="21" ry="16" fill="#0f172a" />
    <path d="M 60 60 Q 55 75 65 80" fill="#0f172a" /> {/* Side hair */}
    
    {/* Face */}
    <circle cx="74" cy="58" r="2" fill="#0f172a" />
    <circle cx="86" cy="58" r="2" fill="#0f172a" />
    <path d="M 76 66 Q 80 69 84 66" stroke="#0f172a" strokeWidth="1.5" fill="none" />
    <circle cx="80" cy="53" r="2" fill="#dc2626" /> {/* Bindi */}
    
    {/* Dupatta/scarf */}
    <path d="M 55 75 Q 50 85 60 95 L 70 80" fill="#a855f7" opacity="0.6" />
  </svg>
);

export const WomanWithProducts = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>
    </defs>
    
    {/* Products/jars on ground */}
    <ellipse cx="130" cy="165" rx="15" ry="20" fill="#dc2626" opacity="0.7" />
    <ellipse cx="155" cy="168" rx="12" ry="18" fill="#f59e0b" opacity="0.7" />
    <ellipse cx="145" cy="172" rx="10" ry="15" fill="#10b981" opacity="0.7" />
    
    {/* Body */}
    <ellipse cx="100" cy="130" rx="32" ry="48" fill="url(#greenGradient)" />
    
    {/* Arms */}
    <ellipse cx="70" cy="110" rx="8" ry="24" fill="#fcd34d" transform="rotate(-25 70 110)" />
    <ellipse cx="130" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(15 130 115)" />
    
    {/* Holding a jar */}
    <ellipse cx="135" cy="135" rx="10" ry="14" fill="#dc2626" opacity="0.8" />
    <rect x="130" y="128" width="10" height="3" fill="#92400e" />
    
    {/* Neck */}
    <rect x="92" y="70" width="16" height="14" fill="#fcd34d" />
    
    {/* Head */}
    <circle cx="100" cy="58" r="21" fill="#fcd34d" />
    
    {/* Hair with paranda (braid decoration) */}
    <ellipse cx="100" cy="48" rx="22" ry="17" fill="#0f172a" />
    <rect x="96" y="75" width="8" height="40" fill="#0f172a" /> {/* Braid */}
    <circle cx="100" cy="95" r="4" fill="#ec4899" /> {/* Hair accessory */}
    <circle cx="100" cy="105" r="4" fill="#fbbf24" />
    
    {/* Face */}
    <circle cx="93" cy="56" r="2" fill="#0f172a" />
    <circle cx="107" cy="56" r="2" fill="#0f172a" />
    <path d="M 95 64 Q 100 67 105 64" stroke="#0f172a" strokeWidth="1.5" fill="none" />
    <circle cx="100" cy="51" r="2" fill="#dc2626" />
    <circle cx="110" cy="60" r="3" fill="#fb7185" opacity="0.5" />
    
    {/* Earrings */}
    <circle cx="81" cy="58" r="4" fill="#fbbf24" />
    <circle cx="119" cy="58" r="4" fill="#fbbf24" />
  </svg>
);

export const WomanBeautyWorker = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    
    {/* Beauty products on table */}
    <rect x="120" y="140" width="8" height="25" rx="2" fill="#ec4899" />
    <rect x="135" y="135" width="10" height="30" rx="2" fill="#8b5cf6" />
    <rect x="150" y="142" width="7" height="23" rx="2" fill="#f97316" />
    
    {/* Table */}
    <rect x="110" y="165" width="70" height="4" fill="#92400e" />
    
    {/* Body */}
    <ellipse cx="90" cy="125" rx="30" ry="45" fill="url(#purpleGradient)" />
    
    {/* Arms */}
    <ellipse cx="65" cy="110" rx="8" ry="23" fill="#fcd34d" transform="rotate(-20 65 110)" />
    <ellipse cx="115" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(20 115 115)" />
    
    {/* Holding makeup brush */}
    <line x1="120" y1="130" x2="135" y2="145" stroke="#92400e" strokeWidth="2" />
    <ellipse cx="137" cy="147" rx="4" ry="6" fill="#fb7185" />
    
    {/* Neck */}
    <rect x="82" y="68" width="16" height="13" fill="#fcd34d" />
    
    {/* Head */}
    <circle cx="90" cy="56" r="20" fill="#fcd34d" />
    
    {/* Modern hairstyle */}
    <ellipse cx="90" cy="46" rx="21" ry="16" fill="#0f172a" />
    <path d="M 70 56 Q 68 65 72 70" fill="#0f172a" />
    <path d="M 110 56 Q 112 65 108 70" fill="#0f172a" />
    
    {/* Face with glasses */}
    <rect x="75" y="53" width="30" height="15" rx="7" fill="none" stroke="#334155" strokeWidth="2" />
    <line x1="83" y1="56" x2="75" y2="56" stroke="#334155" strokeWidth="2" />
    <line x1="97" y1="56" x2="105" y2="56" stroke="#334155" strokeWidth="2" />
    
    <circle cx="82" cy="56" r="1.5" fill="#0f172a" />
    <circle cx="98" cy="56" r="1.5" fill="#0f172a" />
    <path d="M 85 64 Q 90 66 95 64" stroke="#0f172a" strokeWidth="1.5" fill="none" />
    <circle cx="90" cy="49" r="2" fill="#dc2626" />
    
    {/* Lipstick/makeup hint */}
    <path d="M 85 64 L 95 64" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Export as a collection
export const BusinessIllustrations = {
  food: WomanWithBasket,
  tailoring: WomanTailoring,
  crafts: WomanWithProducts,
  beauty: WomanBeautyWorker
};