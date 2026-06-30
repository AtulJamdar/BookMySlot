import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How do I onboard my local business?',
      answer: 'Simply click "Register Your Business" on the landing page, choose the Owner option, enter your business details, and your dashboard will be instantly generated.'
    },
    {
      question: 'Can I add multiple staff members and assign separate categories?',
      answer: 'Yes! Inside the Business Dashboard, you can register unlimited staff members, configure their individual working hours, and select which specific services they offer.'
    },
    {
      question: 'How does the dynamic slot generator prevent booking conflicts?',
      answer: 'Our scheduler automatically checks existing bookings, buffer margins, and staff shift timelines. It generates available booking slots dynamically to ensure zero overlaps.'
    },
    {
      question: 'Can customers track their own booking history?',
      answer: 'Absolutely. Customers register through the portal to access their private Workspace. There they can search for local shops, book time slots, and track or cancel upcoming appointments.'
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center bg-white dark:bg-zinc-950/40 border-y border-zinc-200 dark:border-zinc-900 font-sans py-16">
      <div className="max-w-3xl mx-auto px-6 space-y-12 w-full">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
            Questions & Answers
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Everything you need to know about setting up and scheduling.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20 overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-800"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-zinc-900 dark:text-white transition-colors"
                >
                  {faq.question}
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 border-t border-zinc-200 dark:border-zinc-900' : 'max-h-0'
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="p-5 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed bg-zinc-100/10 dark:bg-zinc-900/10">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
