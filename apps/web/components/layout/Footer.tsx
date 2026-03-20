export function Footer() {
  const shopLinks = ['All Products', 'Family Packs', 'Bulk Orders', 'Export Packs']
  const companyLinks = ['Our Story', 'Impact', 'Our Team', 'Contact']
  const investorLinks = ['Pitch Deck', 'Financials', 'SDG Report', 'Contact IR']

  return (
    <footer className="bg-navy-deep pt-10 px-6 lg:px-16 pb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 bg-orange rounded-full flex items-center justify-center">
              <svg width="16" height="11" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                <ellipse cx="8" cy="7" rx="7" ry="5" fill="white" />
                <path d="M15 7L20 3L20 11Z" fill="white" />
              </svg>
            </div>
            <span className="font-display text-[16px] tracking-[3px] font-black">
              <span className="text-white">BEDO</span>
              <span className="text-orange">FISH</span>
            </span>
          </div>
          <p className="text-white/38 font-body text-xs leading-7 max-w-[200px]">
            Empowering Women, Sustaining Communities, Feeding the World.
          </p>
          <p className="text-white/30 font-body text-xs mt-2.5">info@bedofish.com</p>
          <p className="text-white/30 font-body text-xs mt-1">bedofish.com</p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-white font-body text-[11px] font-semibold uppercase tracking-[1.2px] mb-3">
            SHOP
          </h3>
          {shopLinks.map((link) => (
            <p key={link} className="text-white/38 font-body text-xs mb-1.5 cursor-pointer hover:text-white/70 transition-colors">
              {link}
            </p>
          ))}
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-body text-[11px] font-semibold uppercase tracking-[1.2px] mb-3">
            COMPANY
          </h3>
          {companyLinks.map((link) => (
            <p key={link} className="text-white/38 font-body text-xs mb-1.5 cursor-pointer hover:text-white/70 transition-colors">
              {link}
            </p>
          ))}
        </div>

        {/* Investors */}
        <div>
          <h3 className="text-white font-body text-[11px] font-semibold uppercase tracking-[1.2px] mb-3">
            INVESTORS
          </h3>
          {investorLinks.map((link) => (
            <p key={link} className="text-white/38 font-body text-xs mb-1.5 cursor-pointer hover:text-white/70 transition-colors">
              {link}
            </p>
          ))}
        </div>
      </div>

      <div className="border-t border-white/6 pt-4 flex items-center justify-between">
        <p className="text-white/22 font-body text-[11px]">2026 Bedo Fish. All rights reserved.</p>
        <p className="text-white/22 font-body text-[11px] italic">Its About To Get Fishy</p>
      </div>
    </footer>
  )
}
