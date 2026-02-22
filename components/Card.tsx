'use client'

import React, { memo, useId } from 'react'

export type Suit = 'hearts' | 'spades' | 'clubs' | 'diamonds'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface Props {
  suit?: Suit
  rank?: Rank
  faceUp?: boolean
  className?: string
  style?: React.CSSProperties
  animated?: boolean
  animationDelay?: number
  flipOnLoad?: boolean
}

// Inline SVG cards for portability (no external assets needed)
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}

const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#ff5252',
  diamonds: '#ff5252',
  clubs: '#424242',
  spades: '#424242'
}

const pipPositions: Record<string, Array<{x: number, y: number}>> = {
  'A': [{x: 40, y: 56}],
  '2': [{x: 40, y: 20}, {x: 40, y: 92}],
  '3': [{x: 40, y: 20}, {x: 40, y: 56}, {x: 40, y: 92}],
  '4': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 22, y: 92}, {x: 58, y: 92}],
  '5': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 40, y: 56}, {x: 22, y: 92}, {x: 58, y: 92}],
  '6': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 22, y: 56}, {x: 58, y: 56}, {x: 22, y: 92}, {x: 58, y: 92}],
  '7': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 40, y: 38}, {x: 22, y: 56}, {x: 58, y: 56}, {x: 22, y: 92}, {x: 58, y: 92}],
  '8': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 40, y: 38}, {x: 22, y: 56}, {x: 58, y: 56}, {x: 40, y: 74}, {x: 22, y: 92}, {x: 58, y: 92}],
  '9': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 22, y: 44}, {x: 58, y: 44}, {x: 22, y: 68}, {x: 58, y: 68}, {x: 22, y: 92}, {x: 58, y: 92}, {x: 40, y: 32}],
  '10': [{x: 22, y: 20}, {x: 58, y: 20}, {x: 22, y: 44}, {x: 58, y: 44}, {x: 22, y: 68}, {x: 58, y: 68}, {x: 22, y: 92}, {x: 58, y: 92}, {x: 40, y: 32}, {x: 40, y: 80}],
  'J': [{x: 40, y: 56}],
  'Q': [{x: 40, y: 56}],
  'K': [{x: 40, y: 56}]
}

export function getCardKey(card: { suit: Suit; rank: Rank }): string {
  return `${card.rank}-${card.suit}`
}

function CardComponent({ 
  suit = 'hearts', 
  rank = 'A', 
  faceUp = true, 
  className = '',
  style = {},
  animated = false,
  animationDelay = 0,
  flipOnLoad = false
}: Props) {
  const uniqueId = useId()
  const color = SUIT_COLORS[suit]
  const symbol = SUIT_SYMBOLS[suit]
  const backPatternId = `cardback-${uniqueId}`
  
  if (!faceUp) {
    return (
      <div 
        className={`card card-face-down ${flipOnLoad ? 'animate-flip' : ''} ${className}`}
        style={{
          ...style,
          animationDelay: `${animationDelay}s`,
          perspective: '1000px'
        }}
      >
        <svg viewBox="0 0 80 112" className="w-full h-full rounded-lg">
          <defs>
            <pattern id={backPatternId} patternUnits="userSpaceOnUse" width="8" height="8">
              <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.15)" />
            </pattern>
          </defs>
          <rect width="80" height="112" rx="6" fill="#1e3a5f" />
          <rect x="4" y="4" width="72" height="104" rx="4" fill={`url(#${backPatternId})`} />
          <circle cx="40" cy="56" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        </svg>
      </div>
    )
  }

  const positions = pipPositions[rank] || pipPositions['A']
  const isFaceCard = ['J', 'Q', 'K'].includes(rank)

  return (
    <div 
      className={`card bg-white ${animated ? 'animate-deal' : ''} ${className}`}
      style={{
        ...style,
        animationDelay: `${animationDelay}s`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
    >
      <svg viewBox="0 0 80 112" className="w-full h-full rounded-lg">
        {/* Card background */}
        <rect width="80" height="112" rx="6" fill="white" />
        <rect x="1" y="1" width="78" height="110" rx="5" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        
        {/* Corner rank and suit */}
        <text x="8" y="18" fontSize="12" fontWeight="bold" fill={color}>{rank}</text>
        <text x="8" y="30" fontSize="10" fill={color}>{symbol}</text>
        
        {/* Bottom corner (inverted) */}
        <g transform="rotate(180 40 56)">
          <text x="8" y="18" fontSize="12" fontWeight="bold" fill={color}>{rank}</text>
          <text x="8" y="30" fontSize="10" fill={color}>{symbol}</text>
        </g>
        
        {isFaceCard ? (
          // Face card center design
          <g>
            <rect x="18" y="28" width="44" height="56" rx="4" fill="#f5f5f5" />
            <text x="40" y="60" fontSize="24" textAnchor="middle" fill={color}>{rank}</text>
            <text x="40" y="80" fontSize="20" textAnchor="middle" fill={color}>{symbol}</text>
          </g>
        ) : (
          // Number card pips
          positions.map((pos, i) => (
            <text 
              key={i} 
              x={pos.x} 
              y={pos.y + 4} 
              fontSize={rank === 'A' ? 32 : 14} 
              textAnchor="middle" 
              fill={color}
            >
              {symbol}
            </text>
          ))
        )}
        
        {/* Center ace decoration */}
        {rank === 'A' && (
          <text x="40" y="70" fontSize="24" textAnchor="middle" fill={color} opacity="0.8">{symbol}</text>
        )}
      </svg>
    </div>
  )
}

// Memoized Card component for performance
const Card = memo(CardComponent)
export default Card

// Memoized Card back component
export const CardBack = memo(function CardBack({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) {
  const uniqueId = useId()
  const patternId = `cardback-pattern-${uniqueId}`
  
  return (
    <div className={`card card-face-down ${className}`} style={style}>
      <svg viewBox="0 0 80 112" className="w-full h-full rounded-lg">
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
            <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="80" height="112" rx="6" fill="#1e3a5f" />
        <rect x="4" y="4" width="72" height="104" rx="4" fill={`url(#${patternId})`} />
        <circle cx="40" cy="56" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>
    </div>
  )
})
