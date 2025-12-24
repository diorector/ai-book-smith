'use client';

import { useState } from 'react';

export default function GlobalPublishLanding() {
  const [email, setEmail] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: 실제 폼 제출 연동 (Google Forms, Tally, Notion 등)
    // 지금은 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
            <span className="text-amber-400 text-sm font-medium">
              얼리버드 50% 할인 · 선착순 20명
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            당신의 책,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              4주 만에 아마존에
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            AI 번역 + 네이티브 감수 + 출판 대행
          </p>
          <p className="text-lg text-slate-400 mb-12">
            기존 해외 출판 비용의 <span className="text-amber-400 font-semibold">1/10</span>,
            기간은 <span className="text-amber-400 font-semibold">1/10</span>
          </p>

          {/* CTA Button */}
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-full hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
          >
            무료 상담 신청하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            해외 출판, 왜 어려웠을까요?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: '비용', before: '3,000만원+', desc: '번역비만 수천만원' },
              { icon: '⏰', title: '기간', before: '1~2년', desc: '출판사 컨택부터 출간까지' },
              { icon: '🚪', title: '진입장벽', before: '매우 높음', desc: '어디서부터 시작해야 할지...' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-slate-400 text-sm mb-1">{item.title}</div>
                <div className="text-2xl font-bold text-red-400 mb-2">{item.before}</div>
                <div className="text-slate-500 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            이제 다릅니다
          </h2>
          <p className="text-slate-400 text-center mb-12">
            AI와 출판 전문가가 함께합니다
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: '비용', after: '200만원~', desc: '합리적인 가격' },
              { icon: '⏰', title: '기간', after: '4~6주', desc: '빠른 출간' },
              { icon: '🎯', title: '결과', after: '아마존 출간', desc: '글로벌 독자 도달' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl border border-amber-500/20">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-slate-400 text-sm mb-1">{item.title}</div>
                <div className="text-2xl font-bold text-amber-400 mb-2">{item.after}</div>
                <div className="text-slate-300 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            진행 과정
          </h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'AI 번역', desc: '최신 AI 기술로 빠르고 정확한 1차 번역', duration: '3~5일' },
              { step: 2, title: '네이티브 감수', desc: '영어 원어민 편집자의 자연스러운 교정', duration: '1~2주' },
              { step: 3, title: '표지 현지화', desc: '해외 시장에 맞는 표지 디자인', duration: '1주' },
              { step: 4, title: '아마존 KDP 출판', desc: '메타데이터 최적화 및 출판 등록', duration: '3~5일' },
              { step: 5, title: '마케팅 기본 셋업', desc: '저자 페이지, 카테고리 최적화', duration: '포함' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
                <div className="text-amber-400 text-sm font-medium">
                  {item.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            투명한 가격
          </h2>
          <p className="text-slate-400 text-center mb-12">
            숨겨진 비용 없이, 명확하게
          </p>

          <div className="max-w-md mx-auto p-8 bg-gradient-to-b from-amber-500/10 to-slate-900/50 rounded-3xl border border-amber-500/20">
            <div className="text-center mb-6">
              <div className="text-slate-400 text-sm mb-2">전자책 글로벌 출판 패키지</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-slate-500 line-through text-2xl">400만원</span>
                <span className="text-4xl font-bold text-white">200만원~</span>
              </div>
              <div className="text-amber-400 text-sm mt-2">얼리버드 50% 할인</div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'AI 번역 (영어)',
                '네이티브 편집자 감수',
                '전자책 표지 디자인',
                '아마존 KDP 출판 대행',
                '메타데이터 최적화',
                '기본 마케팅 셋업',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="text-center text-slate-500 text-sm">
              * 분량, 장르에 따라 견적이 달라질 수 있습니다
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">
            왜 저희인가요?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '5년', label: '출판 경력' },
              { number: '20+', label: '출간 도서' },
              { number: '100%', label: '출간 성공률' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-amber-400 mb-2">{item.number}</div>
                <div className="text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-12 text-slate-400 max-w-2xl mx-auto">
            2021년부터 출판사를 운영하며 종이책, 전자책, 해외 저작권까지
            출판의 모든 과정을 경험했습니다.
            이제 AI의 힘을 더해, 더 많은 한국 작가들의 글로벌 진출을 돕습니다.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section id="apply" className="px-6 py-20">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            무료 상담 신청
          </h2>
          <p className="text-slate-400 text-center mb-8">
            24시간 내 연락드립니다
          </p>

          {submitted ? (
            <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">신청이 완료되었습니다!</h3>
              <p className="text-slate-400">
                빠른 시일 내에 연락드리겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">이메일 *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">저자명</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">책 제목 (선택)</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="출판하고 싶은 책 제목"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '제출 중...' : '무료 상담 신청하기'}
              </button>

              <p className="text-slate-500 text-xs text-center">
                신청 정보는 상담 목적으로만 사용됩니다
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '어떤 책이든 가능한가요?',
                a: '소설, 에세이, 자기계발, 비즈니스 등 대부분의 장르가 가능합니다. 전문 기술서나 학술서의 경우 별도 상담이 필요합니다.'
              },
              {
                q: 'AI 번역 품질이 괜찮을까요?',
                a: '최신 AI 번역은 이미 상당한 수준입니다. 여기에 네이티브 편집자의 감수를 더해 자연스럽고 읽기 좋은 영어로 다듬습니다.'
              },
              {
                q: '아마존 외 다른 플랫폼도 가능한가요?',
                a: '네, Apple Books, Kobo 등 다른 플랫폼도 추가 비용으로 가능합니다.'
              },
              {
                q: '인세는 어떻게 되나요?',
                a: '아마존 KDP 기본 인세(35~70%)를 그대로 받으시며, 저희는 출판 대행 수수료만 받습니다.'
              },
              {
                q: '종이책도 가능한가요?',
                a: '이 패키지는 전자책 전용입니다. 종이책(POD)은 별도 상담해주세요.'
              },
            ].map((item, i) => (
              <details key={i} className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-white font-medium">{item.q}</span>
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            당신의 이야기를 세계에
          </h2>
          <p className="text-slate-400 mb-8">
            더 이상 미루지 마세요. 지금 시작하면 한 달 후 아마존에서 만날 수 있습니다.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-full hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
          >
            무료 상담 신청하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 Global Publish. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
