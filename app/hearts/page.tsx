'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Card, { CardBack } from '../../components/Card'

const SLIDES = [
  { id: 'overview', title: 'Overview' },
  { id: 'dealing', title: 'Dealing' },
  { id: 'passing', title: 'Passing' },
  { id: 'trick', title: 'Trick Play' },
  { id: 'scoring', title: 'Scoring' },
  { id: 'gameend', title: 'Winning' }
]

// Component to show a stack of cards (3 visible + count)
function CardStack({ 
  count, 
  label, 
  dealIndex, 
  playerIndex 
}: { 
  count: number
  label: string
  dealIndex: number
  playerIndex: number
}) {
  const playerCards = Math.max(0, Math.floor((dealIndex + 1 - playerIndex) / 4) + (dealIndex + 1 > playerIndex ? 1 : 0))
  const displayCount = Math.min(playerCards, 3)
  const remaining = playerCards - 3

  return (
    <div className="text-center">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1 mt-1">
        <div className="flex">
          {Array.from({length: displayCount}).map((_, i) => (
            <CardBack key={i} className="w-8 h-11" style={{marginLeft: i > 0 ? '-20px' : '0', zIndex: i}} />
          ))}
        </div>
        {remaining > 0 && (
          <span className="text-xs text-slate-500 ml-1">+{remaining}</span>
        )}
      </div>
    </div>
  )
}

export default function HeartsPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [dealIndex, setDealIndex] = useState(-1)
  const [passingStep, setPassingStep] = useState(0)
  const [trickStep, setTrickStep] = useState(0)
  const [showQS, setShowQS] = useState(false)

  const goToSlide = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(SLIDES.length - 1, index))
    setCurrentSlide(clampedIndex)
  }

  // Dealing animation
  useEffect(() => {
    if (currentSlide === 1) {
      setDealIndex(-1)
      const interval = setInterval(() => {
        setDealIndex(prev => {
          if (prev >= 12) {
            clearInterval(interval)
            return 12
          }
          return prev + 1
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [currentSlide])

  // Passing animation
  useEffect(() => {
    if (currentSlide === 2) {
      setPassingStep(0)
      const interval = setInterval(() => {
        setPassingStep(prev => {
          if (prev >= 3) {
            clearInterval(interval)
            return 3
          }
          return prev + 1
        })
      }, 800)
      return () => clearInterval(interval)
    }
  }, [currentSlide])

  // Trick play animation
  useEffect(() => {
    if (currentSlide === 3) {
      setTrickStep(0)
      const interval = setInterval(() => {
        setTrickStep(prev => {
          if (prev >= 4) {
            setTimeout(() => setTrickStep(0), 1500)
            return 0
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentSlide])

  // Scoring animation
  useEffect(() => {
    if (currentSlide === 4) {
      setShowQS(false)
      const timer = setTimeout(() => setShowQS(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [currentSlide])

  const isFirstSlide = currentSlide === 0
  const isLastSlide = currentSlide === SLIDES.length - 1

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header with Home button */}
        <header className="flex items-center justify-between mb-6">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="text-sm text-slate-500">
            {currentSlide + 1} / {SLIDES.length}
          </div>
        </header>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Hearts</h1>
        <p className="text-sm text-slate-500 mb-6">{SLIDES[currentSlide].title}</p>

        {/* Slide Content */}
        <div className="mb-8">
          {/* Slide 1: Overview */}
          {currentSlide === 0 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Avoid taking hearts and the Queen of Spades. The player with the lowest score wins!
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 p-6 bg-white rounded-xl shadow-sm">
                  <Card suit="hearts" rank="A" className="w-14 h-19" />
                  <Card suit="hearts" rank="K" className="w-14 h-19" />
                  <Card suit="hearts" rank="Q" className="w-14 h-19" />
                </div>
                <p className="text-sm text-slate-500">Each <span className="text-red-500">♥ heart</span> = 1 point</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Goal:</strong> Take as few points as possible. The Queen of Spades is worth 13 points!
                </p>
              </div>
            </div>
          )}

          {/* Slide 2: Dealing */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Deal 13 cards to each of the 4 players. Watch as the cards are dealt around the table.
              </p>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="relative h-48">
                  {/* North */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <CardStack count={13} label="North" dealIndex={dealIndex} playerIndex={0} />
                  </div>
                  
                  {/* West */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <CardStack count={13} label="West" dealIndex={dealIndex} playerIndex={3} />
                  </div>
                  
                  {/* East */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <CardStack count={13} label="East" dealIndex={dealIndex} playerIndex={1} />
                  </div>
                  
                  {/* South (You) */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <CardStack count={13} label="You" dealIndex={dealIndex} playerIndex={2} />
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center">
                You get 13 cards at the start of each hand
              </p>
            </div>
          )}

          {/* Slide 3: Passing */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Before each hand, you must pass 3 cards to another player. The direction changes each round.
              </p>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-400">Your Hand</span>
                    <div className="flex gap-1 mt-2">
                      <div className={`transition-all duration-500 ${passingStep >= 1 ? 'opacity-0 -translate-x-10' : ''}`}>
                        <Card suit="hearts" rank="Q" className="w-12 h-16" />
                      </div>
                      <div className={`transition-all duration-500 delay-100 ${passingStep >= 2 ? 'opacity-0 -translate-x-10' : ''}`}>
                        <Card suit="spades" rank="Q" className="w-12 h-16" />
                      </div>
                      <div className={`transition-all duration-500 delay-200 ${passingStep >= 3 ? 'opacity-0 -translate-x-10' : ''}`}>
                        <Card suit="hearts" rank="A" className="w-12 h-16" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-300">→</div>
                  
                  <div className="text-center">
                    <span className="text-xs text-slate-400">To Left</span>
                    <div className="flex gap-1 mt-2 min-h-[64px]">
                      {passingStep >= 1 && <Card suit="hearts" rank="Q" className="w-12 h-16" />}
                      {passingStep >= 2 && <Card suit="spades" rank="Q" className="w-12 h-16" />}
                      {passingStep >= 3 && <Card suit="hearts" rank="A" className="w-12 h-16" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Tip:</strong> Pass high cards and the Queen of Spades to avoid taking points!
                </p>
              </div>
            </div>
          )}

          {/* Slide 4: Trick Play */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Each round, players play one card. You must follow the suit led if you can. The highest card of the led suit wins.
              </p>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-32 h-32 bg-slate-100 rounded-lg">
                    {trickStep >= 1 && (
                      <div className="absolute left-1/2 top-1 -translate-x-1/2">
                        <Card suit="clubs" rank="2" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 2 && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2">
                        <Card suit="clubs" rank="Q" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 3 && (
                      <div className="absolute left-1/2 bottom-1 -translate-x-1/2">
                        <Card suit="clubs" rank="8" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 4 && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2">
                        <Card suit="clubs" rank="5" className="w-10 h-14" />
                      </div>
                    )}
                    
                    {trickStep === 4 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-yellow-200 px-2 py-1 rounded text-xs font-bold text-yellow-800">
                          Queen wins!
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-8 text-xs text-slate-400">
                    <span>West</span>
                    <div className="flex flex-col items-center">
                      <span>North</span>
                      <span>South</span>
                    </div>
                    <span>East</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Rule:</strong> If you can't follow suit, you can play any card. This is how you ditch hearts!
                </p>
              </div>
            </div>
          )}

          {/* Slide 5: Scoring */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Every <span className="text-red-500 font-medium">♥ heart</span> you take is worth 1 point. Watch out for the Queen!
              </p>
              
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Card suit="hearts" rank="2" className="w-12 h-16" />
                  <span className="text-xl text-slate-400">=</span>
                  <span className="text-xl font-bold text-red-500">1 point</span>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className={`transition-all duration-700 ${showQS ? 'scale-110' : ''}`}>
                    <Card suit="spades" rank="Q" className="w-12 h-16" />
                  </div>
                  <span className="text-xl text-slate-400">=</span>
                  <span className="text-xl font-bold text-slate-800">13 points</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 text-center">
                  <strong>Shooting the Moon:</strong><br />
                  Take ALL hearts AND the Queen of Spades, and everyone else gets 26 points instead of you!
                </p>
              </div>
            </div>
          )}

          {/* Slide 6: Winning */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Keep playing hands until someone reaches 100 points. The first player to hit 100 loses — lowest score wins!
              </p>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-3">
                  {/* Scoreboard example */}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-slate-700">You</span>
                    <span className="text-xl font-bold text-green-600">24 pts</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">North</span>
                    <span className="text-xl font-bold text-slate-600">43 pts</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">East</span>
                    <span className="text-xl font-bold text-slate-600">31 pts</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="font-medium text-slate-700">West</span>
                    <span className="text-xl font-bold text-red-600">100+ pts 💥</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  <strong>You win!</strong> You had the lowest score when West hit 100 points.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                <p>♥ = 1 point each</p>
                <p>Q♠ = 13 points</p>
                <p>First to 100 loses</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          {!isFirstSlide ? (
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div className="flex-1" />
          )}
          
          {!isLastSlide ? (
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Continue →
            </button>
          ) : (
            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors text-center"
            >
              Finish ✓
            </Link>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
