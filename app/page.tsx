import Link from 'next/link'
import React from 'react'

const GAMES = [
  { id: 'hearts', name: 'Hearts', icon: '♥', color: 'from-red-500 to-pink-600', available: true },
  { id: 'spades', name: 'Spades', icon: '♠', color: 'from-slate-600 to-slate-800', available: false },
  { id: 'bridge', name: 'Bridge', icon: '♣', color: 'from-blue-600 to-blue-800', available: false },
  { id: 'euchre', name: 'Euchre', icon: '♦', color: 'from-orange-500 to-red-500', available: false },
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🃏</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">World Card Games</h1>
          <p className="text-slate-500 text-sm">Learn and play classic card games</p>
        </header>

        {/* Games grid */}
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center text-xs text-slate-400 space-y-1">
          <p>🎓 Learn the rules with interactive tutorials</p>
          <p>📱 Designed for mobile — play anywhere</p>
          <p className="pt-2">No accounts • No ads • Just cards</p>
        </footer>
      </div>
    </main>
  )
}

interface GameCardProps {
  game: {
    id: string
    name: string
    icon: string
    color: string
    available: boolean
  }
}

function GameCard({ game }: GameCardProps) {
  const baseClasses = "relative overflow-hidden rounded-2xl p-4 transition-all duration-200"
  
  if (game.available) {
    return (
      <Link 
        href={`/${game.id}`}
        className={`${baseClasses} bg-white shadow-md hover:shadow-xl active:scale-95`}
      >
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${game.color} opacity-20 rounded-bl-full`} />
        <div className="relative">
          <span className="text-3xl mb-2 block">{game.icon}</span>
          <h2 className="font-semibold text-slate-800">{game.name}</h2>
          <p className="text-xs text-green-600 font-medium mt-1">Play now →</p>
        </div>
      </Link>
    )
  }
  
  return (
    <div className={`${baseClasses} bg-slate-200/60 opacity-70`}>
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${game.color} opacity-10 rounded-bl-full`} />
      <div className="relative">
        <span className="text-3xl mb-2 block grayscale">{game.icon}</span>
        <h2 className="font-semibold text-slate-500">{game.name}</h2>
        <p className="text-xs text-slate-400 mt-1">Coming soon</p>
      </div>
    </div>
  )
}
