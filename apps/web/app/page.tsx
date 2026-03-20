import { Suspense } from 'react'
import type { Product } from '@bedo-fish/types'
import { HeroAddToCart } from '@/components/product/HeroAddToCart'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { Footer } from '@/components/layout/Footer'

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
  const heroProduct = featured[0] ?? null

  return (
    <>
      {/* ── Section 1: Hero ─────────────────────────── */}
      <section className="bg-navy py-14 px-6 lg:px-16">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center max-w-6xl mx-auto">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange/15 border border-orange/25 rounded-full px-3 py-1.5 mb-5">
              <div className="w-[7px] h-[7px] bg-orange rounded-full" />
              <span className="text-orange font-body text-[11px] font-semibold uppercase tracking-[1.5px]">
                Its About To Get Fishy
              </span>
            </div>

            <h1
              className="font-display font-black text-5xl lg:text-[52px] mb-[18px]"
              style={{ lineHeight: 1.07 }}
            >
              <span className="text-white">Africa&apos;s Finest</span>
              <br />
              <span className="text-orange">Roasted Tilapia</span>
              <br />
              <span className="text-white">Delivered Fresh</span>
            </h1>

            <p className="text-white/[0.62] font-body text-[15px] leading-[1.82] max-w-lg mb-7">
              Every fish we roast fuels healthier diets, empowers women, and scales a sustainable
              future from Lake Victoria to your table.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="/shop"
                className="bg-orange text-white font-body text-[15px] font-medium px-6 py-3.5 rounded-lg hover:bg-orange-dark transition-colors"
              >
                Shop Now
              </a>
              <a
                href="/#our-story"
                className="bg-transparent text-white border-[1.5px] border-white/28 font-body text-[14px] px-5 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Our Story
              </a>
            </div>

            <p className="text-white/30 font-body text-xs mt-5">
              Free delivery in Nairobi on orders above KES 1,500
            </p>
          </div>

          {/* Right: product card */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-6">
              <p className="text-orange font-body text-[10px] font-semibold uppercase tracking-[2px] mb-2">
                TODAY&apos;S SPECIAL
              </p>
              {heroProduct ? (
                <>
                  <p className="text-white text-[18px] font-medium font-body mb-1.5">
                    {heroProduct.name}
                  </p>
                  <p className="text-white/45 text-xs font-body mb-4">{heroProduct.sizeVariant}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange font-display text-[28px] font-bold">
                      KES {parseFloat(heroProduct.priceKes).toLocaleString()}
                    </span>
                    <HeroAddToCart product={heroProduct} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white text-[18px] font-medium font-body mb-1.5">
                    Premium Roasted Tilapia
                  </p>
                  <p className="text-white/45 text-xs font-body mb-4">Whole Fish — 500g</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange font-display text-[28px] font-bold">KES 650</span>
                    <a
                      href="/shop"
                      className="bg-orange text-white font-body text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-orange-dark transition-colors"
                    >
                      Shop Now
                    </a>
                  </div>
                </>
              )}

              {/* Stats mini-grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-orange/10 border border-orange/20 rounded-xl p-4">
                  <p className="text-white font-display text-[26px] font-bold leading-none">486</p>
                  <p className="text-white/45 font-body text-[11px] mt-1">Monthly customers</p>
                </div>
                <div className="bg-white/4 border border-white/7 rounded-xl p-4">
                  <p className="text-white font-display text-[26px] font-bold leading-none">300+</p>
                  <p className="text-white/45 font-body text-[11px] mt-1">Women empowered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <p className="text-white font-display text-[26px] font-bold">{stat.value}</p>
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
          <h2 className="font-display text-[40px] text-navy mt-3 mb-2.5">Our Products</h2>
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
            <h2 className="font-display text-[36px] text-navy leading-tight mb-5">
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
                <p className={`font-display text-[30px] font-bold ${stat.textColor}`}>{stat.value}</p>
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
            <h2 className="font-display text-[34px] text-white">From Lake Victoria to Your Table</h2>
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
                  <span className="text-white font-display text-[18px] font-bold">{step.num}</span>
                </div>
                <h3 className="text-white font-display text-[17px] mb-2.5">{step.title}</h3>
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
            <h2 className="font-display text-[34px] text-navy">Aligned With Global Goals</h2>
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
          <h2 className="font-display text-[40px] text-white max-w-2xl mx-auto leading-tight mb-4">
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
                <p className="text-orange font-display text-[32px] font-bold leading-none">
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
