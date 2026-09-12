export const Logo = ({ compact = false }) => (
  <div className="flex select-none flex-col items-center gap-1.5 leading-none">
    <span
      className={`gold-text font-serif font-bold tracking-[0.34em] ${compact ? 'text-xl' : 'text-2xl md:text-[27px]'}`}
    >
      ROZHINA
    </span>
    <span className="flex items-center gap-2">
      <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/60" />
      <span className="font-serif text-[8px] font-semibold uppercase tracking-[0.42em] text-gold/85 drop-shadow-[0_0_10px_rgba(226,201,151,0.35)] md:text-[9px]">
        Boutique Scarf
      </span>
      <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/60" />
    </span>
  </div>
);