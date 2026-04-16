import { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface Props {
  items: AccordionItem[];
  title?: string;
}

export default function Accordion({ items, title }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">{title}</h2>
        )}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
