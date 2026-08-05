"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { faqs, FAQItem } from '@/data/faqs';

const FAQItemComponent = ({ item, index, isOpen, onToggle }: { item: FAQItem, index: number, isOpen: boolean, onToggle: () => void }) => {
  const tagClass = item.seg === '창업가' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.seg === '지원기관' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <div className={`bg-white border transition-all duration-200 rounded-xl overflow-hidden ${isOpen ? 'border-indigo-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-4 p-5 text-left transition-colors"
      >
        <span className="font-mono text-xs text-slate-400 pt-1.5 w-6 flex-shrink-0">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {item.updated && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full">
                수정됨
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${tagClass}`}>
              {item.seg}
            </span>
          </div>
          <h3 className="text-[15px] sm:text-base font-bold text-slate-900 leading-snug break-keep">
            {item.q}
          </h3>
        </div>
        <ChevronRight className={`w-5 h-5 text-slate-300 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 pb-6 pt-0 ml-10 border-t border-slate-50">
              <div className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap break-keep mt-4">
                {item.a}
              </div>
              <div className="flex flex-wrap gap-2">
                {item.kw.map((k, i) => (
                  <span key={i} className="text-[11px] font-medium bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 font-mono">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [filter, setFilter] = useState<'all' | '창업가' | '지원기관' | '공통'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(f => {
    if (filter === 'all') return true;
    return f.seg === filter;
  });

  return (
    <section className="py-20 sm:py-32 px-6 md:px-12 bg-slate-50/30 border-b border-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-indigo-600 font-bold text-xs tracking-widest uppercase mb-4 block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-indigo-950 mb-4 break-keep">
            자주 묻는 질문
          </h2>
          <p className="text-slate-500 font-medium text-base sm:text-lg break-keep max-w-2xl mx-auto">
            BizDive 서비스 이용에 대해 궁금한 점을 확인해 보세요. <br className="hidden sm:block" />
            찾으시는 내용이 없다면 언제든 문의해 주시기 바랍니다.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'all', label: `전체 ${faqs.length}` },
            { id: '공통', label: '공통' },
            { id: '창업가', label: '창업가' },
            { id: '지원기관', label: '지원기관' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                setFilter(chip.id as typeof filter);
                setOpenIndex(null);
              }}
              aria-pressed={filter === chip.id}
              className={`min-h-11 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                filter === chip.id
                  ? 'bg-indigo-950 text-white border-indigo-900 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((item, i) => (
            <FAQItemComponent
              key={i}
              item={item}
              index={faqs.indexOf(item)}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">해당 조건의 질문이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
