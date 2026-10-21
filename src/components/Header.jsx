import React from 'react'

export default function Header({ theme = 'glass' }) {
  // Style variations based on theme
  const getHeaderStyles = () => {
    switch (theme) {
      case 'bento':
        return {
          wrapper: 'bg-stone-900 border-b border-stone-800 text-white',
          title: 'text-white',
          accent: 'text-sky-400',
          avatarBorder: 'border-2 border-sky-400 shadow-md',
          badge: 'bg-stone-800 text-stone-300 border border-stone-700'
        }
      case 'retro':
        return {
          wrapper: 'bg-[#f4ebe1] border-b-2 border-dashed border-[#b89f88] text-[#3d271d]',
          title: 'text-[#3d271d] font-serif',
          accent: 'text-[#8b4513]',
          avatarBorder: 'border-2 border-[#8b4513] shadow-sm rotate-[-2deg]',
          badge: 'bg-[#e2d1be] text-[#5c3a21] border border-[#a88a6d] font-mono'
        }
      case 'neobrutal':
        return {
          wrapper: 'bg-[#fff] border-b-4 border-black shadow-[0_4px_0_0_#000] text-black',
          title: 'text-black font-black uppercase tracking-wider',
          accent: 'text-sky-600 underline decoration-4',
          avatarBorder: 'border-3 border-black shadow-[3px_3px_0_0_#000]',
          badge: 'bg-amber-300 text-black border-2 border-black font-black'
        }
      case 'fintech':
        return {
          wrapper: 'bg-stone-950 border-b border-stone-800 text-stone-100',
          title: 'text-white font-extrabold tracking-tight',
          accent: 'text-amber-400',
          avatarBorder: 'border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
          badge: 'bg-stone-900 text-amber-400 border border-amber-500/40 text-[10px]'
        }
      case 'glass':
      default:
        return {
          wrapper: 'border-b border-white/50 bg-white/75 backdrop-blur-md shadow-xs text-[#3D2E26]',
          title: 'text-[#422d22]',
          accent: 'text-sky-600',
          avatarBorder: 'border border-sky-300 shadow-sm',
          badge: 'bg-sky-50 text-sky-800 border border-sky-200'
        }
    }
  }

  const s = getHeaderStyles()

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${s.wrapper}`}>
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/forrest.png"
            alt="Forrest Gump"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover transition-transform ${s.avatarBorder}`}
          />
          <div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-tight ${s.title}`}>
              Forrest <span className={s.accent}>Gump</span>
            </h1>
            <p className="text-[11px] opacity-70 font-medium">Chia tiền du lịch thông minh</p>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${s.badge}`}>
          {theme}
        </span>
      </div>
    </header>
  )
}
