export const Logo = ({ light = false, compact = false }) => (
  <div className="flex select-none flex-col items-center gap-1 leading-none">
    <span
      className={`font-serif font-bold tracking-[0.34em] ${compact ? 'text-xl' : 'text-2xl md:text-[27px]'} ${
        light ? 'text-alabaster' : 'text-espresso'
      }`}
    >
      ROZHINA
    </span>
    <span className="flex items-center gap-2">
      <span className={`h-px w-6 bg-gold/70`} />
      <span
        className={`font-serif text-[8px] font-semibold uppercase tracking-[0.42em] md:text-[9px] ${
          light ? 'text-gold' : 'text-taupe'
        }`}
      >
        Boutique Scarf
      </span>
      <span className={`h-px w-6 bg-gold/70`} />
    </span>
  </div>
);