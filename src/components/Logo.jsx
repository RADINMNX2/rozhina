export const Logo = ({ compact = false }) => (
  <div className="flex select-none flex-col items-center gap-1.5 leading-none">
    <span
      className={`gold-text font-serif font-bold ${
        compact ? 'text-[15px] tracking-[0.22em] sm:text-xl sm:tracking-[0.34em]' : 'text-2xl md:text-[27px]'
      }`}
    >
      ROZHINA
    </span>
    <span className={`flex items-center gap-2 ${compact ? 'hidden sm:flex' : ''}`}>
      <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/60" />
      <span className="font-serif text-[8px] font-semibold uppercase tracking-[0.42em] text-gold/85 drop-shadow-[0_0_10px_rgba(226,201,151,0.35)] md:text-[9px]">
        Boutique Scarf
      </span>
      <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/60" />
    </span>
  </div>
);