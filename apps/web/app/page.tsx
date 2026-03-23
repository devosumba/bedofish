import { Suspense } from 'react'
import Image from 'next/image'
import type { Product } from '@bedo-fish/types'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { Footer } from '@/components/layout/Footer'
import { HeroCtaCard } from '@/components/hero/HeroCtaCard'

async function getFeaturedProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'
  try {
    const res = await fetch(`${baseUrl}/products/featured`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { success: boolean; data: Product[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <>
      {/* ── Section 1: Hero ─────────────────────────── */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
        {/* Background image */}
        <Image
          src="/images/bedohome.jpg"
          alt="Bedo Fish hero"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.65))' }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center w-full max-w-5xl mx-auto px-6 pb-36">
          {/* Eyebrow badge */}
          <div className="hero-eyebrow inline-flex items-center border border-white/30 rounded-full px-4 py-1.5 mb-5">
            <span className="font-body text-[11px] font-semibold text-white uppercase tracking-[2.5px]">
              ITS ABOUT TO GET FISHY
            </span>
          </div>

          {/* Headline — 2 lines, words spread across width */}
          <h1
            className="hero-h1 font-heading font-black text-white w-full"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}
          >
            {/* Line 1: Africa's Finest — Roasted — Tilapia */}
            <span
              className="block w-full"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <span>Africa&apos;s Finest</span>
              <span className="relative inline-block">
                Roasted
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C20 4 50 2 90 5C120 7.5 155 9.5 198 6"
                    stroke="#014aad"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Tilapia</span>
            </span>

            {/* Line 2: Delivered — Fresh */}
            <span
              className="block w-full"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.15em' }}
            >
              <span>Delivered</span>
              <span className="relative inline-block">
                Fresh
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C20 4 50 2 90 5C120 7.5 155 9.5 198 6"
                    stroke="#014aad"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="hero-sub font-body text-white/80 max-w-xl mx-auto leading-7 mt-8"
            style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)' }}
          >
            Every fish we roast fuels healthier diets, empowers women, and scales a sustainable
            future from Lake Victoria to your table.
          </p>

          {/* Delivery note */}
          <p className="hero-note font-body text-white/50 text-sm mt-3">
            Free delivery in Nairobi on orders above KES 1,500
          </p>
        </div>

        {/* Glassmorphism CTA card at base of hero */}
        <HeroCtaCard />
      </section>

      {/* ── Section 2: Stats Bar ─────────────────────── */}
      <section className="bg-orange py-5 px-6 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {[
            { value: '60+', label: 'Fish Per Day' },
            { value: '486', label: 'Monthly Customers' },
            { value: '300+', label: 'Women Empowered' },
            { value: '$20B', label: 'Global Market' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center px-7 py-2 ${i < 3 ? 'border-r border-white/22' : ''}`}
            >
              <p className="text-white font-heading text-[26px] font-bold">{stat.value}</p>
              <p className="text-white/75 font-body text-[10px] uppercase tracking-[1.2px] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Products Grid ─────────────────── */}
      <section className="bg-gray-100 py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <span className="bg-orange text-white font-body text-[10px] font-semibold uppercase tracking-[1.5px] px-3 py-1.5 rounded-full">
            Order Fresh Today
          </span>
          <h2 className="font-heading font-bold text-[40px] text-navy mt-3 mb-2.5">Our Products</h2>
          <p className="text-gray-600 font-body text-[15px] max-w-lg leading-[1.75]">
            Sustainably sourced from Lake Victoria. Roasted fresh daily using energy-efficient ovens.
            Packaged to international standards.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Suspense
              fallback={Array.from({ length: 3 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            >
              {featured.length > 0
                ? featured.map((p) => <ProductCard key={p.id} product={p} />)
                : Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </Suspense>
          </div>

          <div className="text-center mt-8">
            <a
              href="/shop"
              className="inline-block bg-navy text-white font-body font-medium px-6 py-3 rounded-lg hover:bg-navy-mid transition-colors"
            >
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 4: Mission ───────────────────────── */}
      <section className="bg-white py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-orange/15 border border-orange/25 text-orange font-body text-[10px] font-semibold uppercase tracking-[1.2px] px-3 py-1.5 rounded-full mb-3">
              Our Mission
            </span>
            <h2 className="font-heading font-bold text-[36px] text-navy leading-tight mb-5">
              Empowering Women,
              <br />
              Sustaining Communities
            </h2>
            <p className="text-gray-600 font-body text-[15px] leading-7 mb-3">
              We are a women-led social enterprise transforming Lake Victoria&apos;s tilapia into a
              premium roasted product. Our model creates dignified jobs and opens export markets for
              sustainable African protein.
            </p>
            <p className="text-gray-600 font-body text-[15px] leading-7">
              100% self-financed to date. Every purchase directly supports women processors in Lake
              Victoria fishing communities.
            </p>
            <a
              href="/shop"
              className="inline-block mt-6 bg-navy text-white font-body font-medium px-6 py-3 rounded-lg hover:bg-navy-mid transition-colors"
            >
              Shop Our Products
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: '40%',
                borderColor: 'border-orange',
                textColor: 'text-orange',
                label: 'Emission reduction via modern energy-efficient ovens',
              },
              {
                value: '300+',
                borderColor: 'border-navy-mid',
                textColor: 'text-navy-mid',
                label: 'Women empowered with jobs and training',
              },
              {
                value: '3+',
                borderColor: 'border-brand-green',
                textColor: 'text-brand-green',
                label: 'Export markets targeted',
              },
              {
                value: '$4B',
                borderColor: 'border-orange',
                textColor: 'text-orange',
                label: 'African tilapia market opportunity',
              },
            ].map((stat) => (
              <div key={stat.value} className={`bg-gray-100 rounded-xl p-5 border-l-4 ${stat.borderColor}`}>
                <p className={`font-heading text-[30px] font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-gray-600 font-body text-xs mt-1.5 leading-5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: How It Works ──────────────────── */}
      <section id="our-story" className="bg-navy py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex bg-orange/20 text-orange font-body text-[10px] font-semibold uppercase tracking-[1.2px] px-3 py-1.5 rounded-full mb-3">
              The Bedo Fish Model
            </span>
            <h2 className="font-heading font-bold text-[34px] text-white">From Lake Victoria to Your Table</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                num: '01',
                title: 'Sourcing',
                copy: 'We partner with Lake Victoria fishing communities to secure a consistent supply of fresh tilapia while supporting responsible fishing practices.',
              },
              {
                num: '02',
                title: 'Processing',
                copy: 'Fish is roasted using modern, energy-efficient ovens and packaged to meet both domestic and international standards.',
              },
              {
                num: '03',
                title: 'Distribution',
                copy: "Delivered to Kenya's urban supermarkets, hotels, and institutions, while targeting high-value export markets across Africa, Europe, and the Middle East.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 bg-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-heading text-[18px] font-bold">{step.num}</span>
                </div>
                <h3 className="text-white font-heading text-[17px] mb-2.5">{step.title}</h3>
                <p className="text-white/55 font-body text-[13px] leading-7">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: SDG Impact ────────────────────── */}
      <section id="impact" className="bg-gray-100 py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="inline-flex bg-orange/15 border border-orange/25 text-orange font-body text-[10px] font-semibold uppercase tracking-[1.2px] px-3 py-1.5 rounded-full mb-3">
              Impact
            </span>
            <h2 className="font-heading font-bold text-[34px] text-navy">Aligned With Global Goals</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                sdg: 'SDG 5',
                color: '#E5243B',
                title: 'Gender Equality',
                copy: 'Empowering 300+ women with jobs, training, and leadership roles across the fish value chain.',
              },
              {
                sdg: 'SDG 8',
                color: '#A21942',
                title: 'Decent Work',
                copy: 'Creating inclusive employment in fisheries while strengthening local economies.',
              },
              {
                sdg: 'SDG 12',
                color: '#BF8B2E',
                title: 'Responsible Production',
                copy: 'Reducing food waste by extending shelf life and cutting post-harvest losses.',
              },
              {
                sdg: 'SDG 13',
                color: '#3F7E44',
                title: 'Climate Action',
                copy: 'Energy-efficient roasting technologies reduce carbon emissions by up to 40%.',
              },
            ].map((card) => (
              <div
                key={card.sdg}
                className="bg-white rounded-xl p-5"
                style={{ borderTop: `4px solid ${card.color}` }}
              >
                <p
                  className="font-body text-[10px] font-bold tracking-[1px] mb-1"
                  style={{ color: card.color }}
                >
                  {card.sdg}
                </p>
                <p className="text-navy font-body text-[13px] font-semibold mb-1.5">{card.title}</p>
                <p className="text-gray-400 font-body text-[11px] leading-6">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Investor CTA ──────────────────── */}
      <section id="invest" className="bg-navy-deep py-16 px-6 lg:px-16 text-center">
        <div className="max-w-6xl mx-auto">
          <span className="inline-flex bg-orange/[0.18] text-orange font-body text-[10px] font-semibold uppercase tracking-[1.2px] px-3 py-1.5 rounded-full mb-5">
            Invest in Bedo Fish
          </span>
          <h2 className="font-heading font-bold text-[40px] text-white max-w-2xl mx-auto leading-tight mb-4">
            A $462,000 Opportunity to Scale Africa&apos;s Next Great Food Brand
          </h2>
          <p className="text-white/55 font-body text-[15px] max-w-xl mx-auto leading-7 mb-8">
            Catalytic capital to modernize production, unlock new markets, and deliver sustainable
            growth. Breakeven within 48 months.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <button className="bg-orange text-white font-body font-medium px-7 py-3.5 rounded-lg hover:bg-orange-dark transition-colors">
              Request Investor Deck
            </button>
            <button className="bg-transparent text-white border-[1.5px] border-white/28 font-body px-6 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              Schedule a Call
            </button>
          </div>

          <div className="flex justify-center gap-4 flex-wrap mt-10">
            {[
              { value: '50%', label: 'Projected sales growth' },
              { value: '3+', label: 'Export markets targeted' },
              { value: '48mo', label: 'Breakeven timeline' },
            ].map((chip) => (
              <div
                key={chip.value}
                className="bg-white/5 border border-white/[0.08] rounded-xl p-5 min-w-[140px] text-center"
              >
                <p className="text-orange font-heading text-[32px] font-bold leading-none">
                  {chip.value}
                </p>
                <p className="text-white/45 font-body text-[11px] mt-1">{chip.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
