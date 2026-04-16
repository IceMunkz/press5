import { useState } from 'react';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

interface Props {
  tiers: PricingTier[];
  title?: string;
  subtitle?: string;
}

export default function PricingTable({ tiers, title, subtitle }: Props) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 ${
              annual ? 'bg-brand-blue' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                annual ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              2 months free
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-brand-gradient text-white shadow-2xl shadow-blue-900/25 scale-105'
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm ${tier.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                      £{price.toFixed(2)}
                    </span>
                    <span className={`text-sm ${tier.popular ? 'text-blue-200' : 'text-gray-400'}`}>
                      /mo{annual ? ' (billed annually)' : ''}
                    </span>
                  </div>
                  {annual && (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-blue-200' : 'text-gray-400'}`}>
                      £{(price * 12).toFixed(2)} billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.popular ? 'text-blue-200' : 'text-brand-blue'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${tier.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.ctaHref ?? '/contact'}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    tier.popular
                      ? 'bg-white text-brand-blue hover:bg-blue-50'
                      : 'bg-brand-gradient text-white hover:opacity-90'
                  }`}
                >
                  {tier.ctaLabel ?? 'Choose Plan'}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All prices in GBP. No setup fees. Cancel any time.{' '}
          <a href="/contact" className="text-brand-blue hover:underline font-medium">
            Questions? Contact us →
          </a>
        </p>
      </div>
    </section>
  );
}
