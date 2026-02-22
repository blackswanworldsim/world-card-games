'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Card, { CardBack } from '../../components/Card'

const SLIDES = [
  { id: 'overview', title: 'Overview' },
  { id: 'dealing', title: 'Dealing' },
  { id: 'passing', title: 'Passing' },
  { id: 'trick', title: 'Trick Play' },
  { id: 'scoring', title: 'Scoring' }
]

export default function HeartsPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dealIndex, setDealIndex] = useState(-1)
  const [passingStep, setPassingStep] = useState(0)
  const [trickStep, setTrickStep] = useState(0)
  const [showQS, setShowQS] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Auto-advance dealing animation on slide 2
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

  // Passing animation on slide 3
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

  // Trick play animation on slide 4
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

  // Scoring animation on slide 5
  useEffect(() => {
    if (currentSlide === 4) {
      setShowQS(false)
      const timer = setTimeout(() => {
        setShowQS(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentSlide])

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
    if (carouselRef.current) {
      setScrollLeft(carouselRef.current.scrollLeft)
    }
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const walk = (startX - clientX) * 1.5
    carouselRef.current.scrollLeft = scrollLeft + walk
  }

  const handleTouchEnd = () => {
    if (!carouselRef.current) return
    setIsDragging(false)
    
    const slideWidth = carouselRef.current.offsetWidth
    const newIndex = Math.round(carouselRef.current.scrollLeft / slideWidth)
    const clampedIndex = Math.max(0, Math.min(SLIDES.length - 1, newIndex))
    
    goToSlide(clampedIndex)
  }

  const goToSlide = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(SLIDES.length - 1, index))
    setCurrentSlide(clampedIndex)
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: clampedIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Hearts</h1>
          <p className="text-sm text-slate-500">Swipe to learn how to play</p>
        </header>

        {/* Carousel */}
        <div className="relative mb-6">
          <div 
            ref={carouselRef}
            className="carousel-container flex overflow-x-auto snap-x snap-mandatory"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={() => isDragging && handleTouchEnd()}
          >
            {/* Slide 1: Overview */}
            <section className="carousel-slide min-w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">How to Play Hearts</h2>
                <p className="text-sm text-slate-600 mb-6">
                  Avoid taking hearts and the Queen of Spades. Lowest score wins!
                </p>
                
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="relative flex items-center gap-1 animate-pulse-glow p-6 rounded-2xl" style={{animationDuration: '3s'}}>
                    <Card suit="hearts" rank="A" className="w-16 h-22" />
                    <Card suit="hearts" rank="K" className="w-16 h-22" />
                    <Card suit="hearts" rank="Q" className="w-16 h-22" />
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Each heart = 1 point</p>
                </div>
              </div>
            </section>

            {/* Slide 2: Dealing */}
            <section className="carousel-slide min-w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Dealing</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Deal 13 cards to each of the 4 players
                </p>
                
                <div className="relative h-56">
                  {/* Player positions */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-xs text-slate-400 mb-1">North</div>
                    <div className="flex gap-0.5 justify-center" style={{width: '60px'}}>
                      {dealIndex >= 0 && Array.from({length: Math.min(13, Math.max(0, dealIndex - 9))}).map((_, i) => (
                        <CardBack key={i} className="w-6 h-8" style={{marginLeft: '-4px'}} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
                    <div className="text-xs text-slate-400 mb-1">West</div>
                    <div className="flex flex-col gap-0.5" style={{height: '60px'}}>
                      {dealIndex >= 0 && Array.from({length: Math.min(13, Math.max(0, dealIndex - 6))}).map((_, i) => (
                        <CardBack key={i} className="w-6 h-8" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                    <div className="text-xs text-slate-400 mb-1">East</div>
                    <div className="flex flex-col gap-0.5" style={{height: '60px'}}>
                      {dealIndex >= 0 && Array.from({length: Math.min(13, Math.max(0, dealIndex - 3))}).map((_, i) => (
                        <CardBack key={i} className="w-6 h-8" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-xs text-slate-400 mb-1">You (South)</div>
                    <div className="flex gap-0.5 justify-center flex-wrap-reverse" style={{width: '80px'}}>
                      {dealIndex >= 0 && Array.from({length: Math.min(13, dealIndex + 1)}).map((_, i) => (
                        <CardBack key={i} className="w-6 h-8" style={{marginLeft: '-4px'}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Slide 3: Passing */}
            <section className="carousel-slide min-w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Passing Cards</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Select 3 cards to pass to the left
                </p>
                
                <div className="relative h-56 flex items-center">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-400 mb-2">Your hand</div>
                    <div className="flex justify-center gap-2">
                      <div className={`transition-all duration-500 ${passingStep >= 1 ? 'opacity-0 -translate-x-20' : ''}`}>
                        <Card suit="hearts" rank="Q" className="w-12 h-16" />
                      </div>
                      <div className={`transition-all duration-500 delay-100 ${passingStep >= 2 ? 'opacity-0 -translate-x-20' : ''}`}>
                        <Card suit="spades" rank="Q" className="w-12 h-16" />
                      </div>
                      <div className={`transition-all duration-500 delay-200 ${passingStep >= 3 ? 'opacity-0 -translate-x-20' : ''}`}>
                        <Card suit="hearts" rank="A" className="w-12 h-16" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-3xl text-slate-300 mx-4">→</div>
                  
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-400 mb-2">Player to your left</div>
                    <div className="flex justify-center gap-1">
                      {passingStep >= 1 && (
                        <div className="animate-slide-left" style={{animationDelay: '0s'}}>
                          <Card suit="hearts" rank="Q" className="w-12 h-16" />
                        </div>
                      )}
                      {passingStep >= 2 && (
                        <div className="animate-slide-left" style={{animationDelay: '0.1s'}}>
                          <Card suit="spades" rank="Q" className="w-12 h-16" />
                        </div>
                      )}
                      {passingStep >= 3 && (
                        <div className="animate-slide-left" style={{animationDelay: '0.2s'}}>
                          <Card suit="hearts" rank="A" className="w-12 h-16" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Slide 4: Trick Play */}
            <section className="carousel-slide min-w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Playing a Trick</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Must follow suit if possible. Highest card of led suit wins.
                </p>
                
                <div className="relative h-56 flex items-center justify-center">
                  {/* Center area */}
                  <div className="relative w-32 h-32 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Cards fly in from 4 directions */}
                    {trickStep >= 1 && (
                      <div className="absolute left-1/2 top-2 -translate-x-1/2 animate-fly-to-center" style={{'--start-x': '0', '--start-y': '-50px'} as React.CSSProperties}>
                        <Card suit="clubs" rank="2" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 2 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-fly-to-center" style={{'--start-x': '50px', '--start-y': '0', animationDelay: '0.1s'} as React.CSSProperties}>
                        <Card suit="clubs" rank="Q" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 3 && (
                      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 animate-fly-to-center" style={{'--start-x': '0', '--start-y': '50px', animationDelay: '0.2s'} as React.CSSProperties}>
                        <Card suit="clubs" rank="8" className="w-10 h-14" />
                      </div>
                    )}
                    {trickStep >= 4 && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 animate-fly-to-center" style={{'--start-x': '-50px', '--start-y': '0', animationDelay: '0.3s'} as React.CSSProperties}>
                        <Card suit="clubs" rank="5" className="w-10 h-14" />
                      </div>
                    )}
                    
                    {trickStep === 4 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-yellow-100 px-2 py-1 rounded text-xs font-medium text-yellow-700 animate-heart-bounce">
                          Queen wins!
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Player labels */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">North</div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">East</div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">South (You)</div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">West</div>
                </div>
              </div>
            </section>

            {/* Slide 5: Scoring */}
            <section className="carousel-slide min-w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Scoring</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Each heart is 1 point. Queen of Spades is 13 points.
                </p>
                
                <div className="flex flex-col items-center justify-center h-56 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Card suit="hearts" rank="2" className="w-12 h-16" />
                      <span className="text-2xl text-slate-400">=</span>
                      <span className="text-2xl font-bold text-red-500">1 pt</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className={`transition-all duration-700 ${showQS ? 'animate-flip' : ''}`}>
                        <Card suit="spades" rank="Q" className="w-12 h-16" />
                      </div>
                      <span className="text-2xl text-slate-400">=</span>
                      <span className="text-2xl font-bold text-slate-800">13 pts</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700 text-center">
                      <strong>Shooting the Moon:</strong><br />
                      Take ALL hearts AND the Queen of Spades.<br />
                      Every other player gets 26 points instead!
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Navigation arrows */}
          <button 
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-600 disabled:opacity-30 btn-touch"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button 
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide === SLIDES.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-600 disabled:opacity-30 btn-touch"
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label={`Go to ${slide.title}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link 
            href="/hearts/demo" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg btn-touch"
          >
            Try Interactive Demo →
          </Link>
        </div>
      </div>
    </main>
  )
}
