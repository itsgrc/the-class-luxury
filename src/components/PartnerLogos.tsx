const PARTNERS = [
  'Cipriani', 'Aman Resorts', 'Pininfarina', 'Patek Philippe',
  'Bulgari', 'Sanlorenzo', 'Gulfstream', 'Rolls-Royce',
]

export function PartnerLogos() {
  return (
    <div className="py-12 border-t border-[rgba(197,160,89,0.15)]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[10px] text-[#5A4F44]/50 tracking-[0.25em] uppercase font-[family-name:var(--font-family-mono)] mb-8">
          Partner selezionati
        </p>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {PARTNERS.map(name => (
            <span
              key={name}
              className="font-[family-name:var(--font-family-display)] text-sm text-[rgba(197,160,89,0.35)] tracking-widest hover:text-[rgba(197,160,89,0.65)] transition-colors duration-300 cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
