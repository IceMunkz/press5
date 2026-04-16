import { useState } from 'react';

const SLOT_TIERS = [
  { slots: 10, monthly: 2.99 },
  { slots: 25, monthly: 4.99 },
  { slots: 32, monthly: 5.99 },
  { slots: 50, monthly: 7.99 },
  { slots: 64, monthly: 9.99 },
  { slots: 100, monthly: 13.99 },
  { slots: 128, monthly: 16.99 },
  { slots: 256, monthly: 28.99 },
  { slots: 512, monthly: 49.99 },
];

export default function SlotCalculator() {
  const [slotIndex, setSlotIndex] = useState(2);
  const [annual, setAnnual] = useState(false);

  const tier = SLOT_TIERS[slotIndex]!;
  const price = annual ? (tier.monthly * 10).toFixed(2) : tier.monthly.toFixed(2);
  const savings = annual ? ((tier.monthly * 12) - (tier.monthly * 10)).toFixed(2) : null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How Many Slots Do You Need?</h2>
          <p className="text-gray-600">Drag the slider to find your perfect plan.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {/* Slot count display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-extrabold text-brand-blue mb-2">{tier.slots}</div>
            <div className="text-gray-500 font-medium">slots</div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={SLOT_TIERS.length - 1}
            value={slotIndex}
            onChange={e => setSlotIndex(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-blue mb-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mb-8">
            <span>10 slots</span>
            <span>512 slots</span>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-brand-blue' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual
              <span className="ml-1 text-xs text-green-600 font-semibold">-17%</span>
            </span>
          </div>

          {/* Price */}
          <div className="bg-brand-gradient rounded-xl p-6 text-white text-center mb-6">
            <div className="text-4xl font-extrabold">£{price}</div>
            <div className="text-blue-100 text-sm mt-1">
              per month{annual ? ', billed annually' : ''}
            </div>
            {savings && (
              <div className="mt-2 text-xs bg-white/20 rounded-lg px-3 py-1 inline-block">
                Save £{savings}/year vs monthly
              </div>
            )}
          </div>

          <a
            href={`/contact?service=teamspeak&slots=${tier.slots}`}
            className="block w-full text-center py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Order {tier.slots} Slots
          </a>

          <p className="text-center text-xs text-gray-400 mt-4">
            Need more than 512 slots or a custom setup?{' '}
            <a href="/contact" className="text-brand-blue hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
