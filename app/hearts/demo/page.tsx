'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import Card, { CardBack, getCardKey, type Suit, type Rank } from '../../../components/Card'

interface CardDef {
  suit: Suit
  rank: Rank
}

type Player = 'north' | 'east' | 'south' | 'west'

const SUITS: Suit[] = ['clubs', 'diamonds', 'spades', 'hearts']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const PLAYER_ORDER: Player[] = ['south', 'east', 'north', 'west']

// Deterministic shuffle using a simple seeded random
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array]
  const rand = seededRandom(seed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function createDeck(): CardDef[] {
  const deck: CardDef[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

function getCardValue(rank: Rank): number {
  return RANKS.indexOf(rank)
}

function getNextPlayer(player: Player): Player {
  const idx = PLAYER_ORDER.indexOf(player)
  return PLAYER_ORDER[(idx + 1) % 4]
}

export default function DemoPage() {
  const [gameState, setGameState] = useState<'dealing' | 'playing' | 'collecting' | 'finished'>('dealing')
  const [hands, setHands] = useState<Record<Player, CardDef[]>>({ north: [], east: [], south: [], west: [] })
  const [currentTrick, setCurrentTrick] = useState<{ player: Player; card: CardDef }[]>([])
  const [scores, setScores] = useState<Record<Player, number>>({ north: 0, east: 0, south: 0, west: 0 })
  const [tricksTaken, setTricksTaken] = useState<Record<Player, number>>({ north: 0, east: 0, south: 0, west: 0 })
  const [leader, setLeader] = useState<Player>('south')
  const [message, setMessage] = useState('Dealing cards...')
  const [dealingIndex, setDealingIndex] = useState(-1)
  const [trickCount, setTrickCount] = useState(0)
  const [heartsBroken, setHeartsBroken] = useState(false)
  const playAgainRef = useRef<HTMLButtonElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  // Deterministic deal (seeded for reproducibility)
  useEffect(() => {
    const deck = shuffleWithSeed(createDeck(), 42) // Fixed seed for deterministic demo
    const newHands: Record<Player, CardDef[]> = {
      north: deck.slice(0, 13),
      east: deck.slice(13, 26),
      south: deck.slice(26, 39),
      west: deck.slice(39, 52)
    }
    setHands(newHands)
    
    // Animate dealing
    let idx = 0
    const interval = setInterval(() => {
      setDealingIndex(idx)
      idx++
      if (idx >= 52) {
        clearInterval(interval)
        setTimeout(() => {
          setGameState('playing')
          setMessage('Your turn! Click a card to play. Hearts not broken.')
        }, 500)
      }
    }, 40)
    
    return () => clearInterval(interval)
  }, [])

  // Announce message changes to screen readers
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.focus()
    }
  }, [message])

  // Determine trick winner - FIXED: safe reduce with fallback
  const determineWinner = useCallback((trick: { player: Player; card: CardDef }[], leadSuit: Suit): Player => {
    const matching = trick.filter(t => t.card.suit === leadSuit)
    if (matching.length === 0) return trick[0]?.player || 'south'
    const best = matching.reduce((best, t) => 
      getCardValue(t.card.rank) > getCardValue(best.card.rank) ? t : best
    , matching[0])
    return best.player
  }, [])

  // Calculate points in cards
  const countPoints = useCallback((cards: CardDef[]): number => {
    return cards.reduce((sum, card) => {
      if (card.suit === 'hearts') return sum + 1
      if (card.suit === 'spades' && card.rank === 'Q') return sum + 13
      return sum
    }, 0)
  }, [])

  // Check if user can legally play a card
  const canPlayCard = useCallback((card: CardDef, hand: CardDef[]): boolean => {
    if (currentTrick.length === 0) {
      // Leading - cannot lead hearts unless hearts broken or only hearts left
      if (card.suit === 'hearts' && !heartsBroken) {
        const nonHearts = hand.filter(c => c.suit !== 'hearts')
        if (nonHearts.length > 0) return false
      }
      return true
    }
    // Must follow suit if possible
    const leadSuit = currentTrick[0].card.suit
    const hasLeadSuit = hand.some(c => c.suit === leadSuit)
    if (hasLeadSuit) {
      return card.suit === leadSuit
    }
    return true
  }, [currentTrick, heartsBroken])

  // Auto-play for computer players - FIXED: safe index finding
  const autoPlay = useCallback((player: Player, leadSuit?: Suit) => {
    setHands(currentHands => {
      const hand = currentHands[player]
      if (!hand || hand.length === 0) return currentHands
      
      let validCards = hand
      
      // Must follow suit if possible
      if (leadSuit) {
        const following = hand.filter(c => c.suit === leadSuit)
        if (following.length > 0) {
          validCards = following
        }
      }
      
      // Pick lowest card (simple strategy)
      const toPlay = validCards.reduce((lowest, card) => 
        getCardValue(card.rank) < getCardValue(lowest.rank) ? card : lowest
      , validCards[0])
      
      const cardIndex = hand.findIndex(c => 
        c.rank === toPlay.rank && c.suit === toPlay.suit
      )
      const playIdx = cardIndex === -1 ? 0 : cardIndex
      
      setTimeout(() => playCard(player, playIdx), 400)
      return currentHands
    })
  }, [])

  // Play a card - FIXED: proper state updates
  const playCard = useCallback((player: Player, cardIndex: number) => {
    setGameState(currentState => {
      if (currentState !== 'playing') return currentState
      
      setHands(currentHands => {
        const hand = currentHands[player]
        if (!hand || cardIndex < 0 || cardIndex >= hand.length) return currentHands
        
        const card = hand[cardIndex]
        const newHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)]
        
        setCurrentTrick(currentTrick => {
          const newTrick = [...currentTrick, { player, card }]
          
          // Track hearts broken
          if (card.suit === 'hearts' && !heartsBroken) {
            setHeartsBroken(true)
          }
          
          if (newTrick.length === 4) {
            // Trick complete
            const leadSuit = newTrick[0].card.suit
            const winner = determineWinner(newTrick, leadSuit)
            const points = countPoints(newTrick.map(t => t.card))
            const newTrickCount = trickCount + 1
            
            setMessage(`${winner === 'south' ? 'You win' : winner + ' wins'} the trick!${points > 0 ? ` +${points} points` : ''}`)
            
            setTimeout(() => {
              setScores(prev => ({ ...prev, [winner]: prev[winner] + points }))
              setTricksTaken(prev => ({ ...prev, [winner]: prev[winner] + 1 }))
              setCurrentTrick([])
              setLeader(winner)
              setTrickCount(newTrickCount)
              
              if (newTrickCount >= 13) {
                setGameState('finished')
                setMessage('Game complete! Final scores displayed.')
                // Focus play again button for accessibility
                setTimeout(() => playAgainRef.current?.focus(), 100)
              } else {
                setGameState('playing')
                setMessage(winner === 'south' 
                  ? 'Your turn! Lead a card.' + (heartsBroken ? '' : ' Hearts not broken.')
                  : `${winner} leads...`
                )
                
                if (winner !== 'south') {
                  setTimeout(() => autoPlay(winner), 600)
                }
              }
            }, 1500)
            
            return newTrick
          } else {
            // Continue trick
            const nextPlayer = getNextPlayer(player)
            if (nextPlayer !== 'south') {
              setTimeout(() => autoPlay(nextPlayer, newTrick[0].card.suit), 400)
            } else {
              const leadSuit = newTrick[0].card.suit
              setMessage(`Your turn! ${leadSuit !== 'hearts' ? 'Follow ' + leadSuit + ' if possible.' : 'Play any card.'}`)
            }
            return newTrick
          }
        })
        
        return { ...currentHands, [player]: newHand }
      })
      
      return 'collecting'
    })
  }, [determineWinner, countPoints, trickCount, heartsBroken, autoPlay])

  // Handle user card click
  const handleUserCardClick = (cardIndex: number) => {
    if (gameState !== 'playing') return
    const card = hands.south[cardIndex]
    if (!card || !canPlayCard(card, hands.south)) return
    playCard('south', cardIndex)
  }

  // Sort hand by suit then rank - MEMOIZED
  const sortedHand = useMemo(() => {
    return [...hands.south].sort((a, b) => {
      if (SUITS.indexOf(a.suit) !== SUITS.indexOf(b.suit)) {
        return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)
      }
      return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank)
    })
  }, [hands.south])

  const getDealCards = (player: Player): number => {
    const playerIdx = PLAYER_ORDER.indexOf(player)
    const cardsPerPlayer = Math.floor((dealingIndex + 1) / 4)
    const remainder = (dealingIndex + 1) % 4
    return cardsPerPlayer + (remainder > playerIdx ? 1 : 0)
  }

  const getPlayerLabel = (p: Player): string => {
    const labels: Record<Player, string> = {
      north: 'North',
      east: 'East',
      south: 'South (You)',
      west: 'West'
    }
    return labels[p]
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-800 to-green-900">
      <div className="max-w-md mx-auto px-4 py-4">
        <header className="flex items-center justify-between mb-4">
          <Link href="/hearts" className="text-green-300 hover:text-white text-sm">← Back to tutorial</Link>
          <div className="text-white font-semibold">Trick {Math.min(trickCount + 1, 13)}/13</div>
        </header>

        {/* Game table */}
        <div 
          className="relative aspect-square bg-green-700 rounded-2xl shadow-2xl p-4"
          role="region"
          aria-label="Hearts game table"
        >
          {/* Score display - high contrast */}
          <div className="absolute top-2 left-2 right-2 flex justify-between text-xs">
            <span className="text-white font-medium drop-shadow">N:{scores.north}</span>
            <span className="text-white font-medium drop-shadow">E:{scores.east}</span>
            <span className="text-white font-medium drop-shadow">W:{scores.west}</span>
            <span className="text-white font-medium drop-shadow">S:{scores.south}</span>
          </div>

          {/* North player */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-xs font-medium text-white drop-shadow mb-1">North</span>
            <div className="flex gap-0.5">
              {gameState === 'dealing' 
                ? Array.from({length: getDealCards('north')}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginLeft: i > 0 ? '-6px' : '0'}} />
                  ))
                : Array.from({length: hands.north.length}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginLeft: i > 0 ? '-6px' : '0'}} />
                  ))
              }
            </div>
          </div>

          {/* West player */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-xs font-medium text-white drop-shadow mb-1">West</span>
            <div className="flex flex-col gap-0.5">
              {gameState === 'dealing'
                ? Array.from({length: Math.min(getDealCards('west'), 8)}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginTop: i > 0 ? '-4px' : '0'}} />
                  ))
                : Array.from({length: Math.min(hands.west.length, 8)}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginTop: i > 0 ? '-4px' : '0'}} />
                  ))
              }
            </div>
          </div>

          {/* East player */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-xs font-medium text-white drop-shadow mb-1">East</span>
            <div className="flex flex-col gap-0.5">
              {gameState === 'dealing'
                ? Array.from({length: Math.min(getDealCards('east'), 8)}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginTop: i > 0 ? '-4px' : '0'}} />
                  ))
                : Array.from({length: Math.min(hands.east.length, 8)}).map((_, i) => (
                    <CardBack key={i} className="w-8 h-11" style={{marginTop: i > 0 ? '-4px' : '0'}} />
                  ))
              }
            </div>
          </div>

          {/* Trick area (center) */}
          <div className="absolute inset-0 flex items-center justify-center" aria-label="Current trick">
            <div className="relative w-32 h-32">
              {currentTrick.map((play, i) => {
                const pos = play.player === 'north' ? { x: 32, y: 0 } :
                            play.player === 'south' ? { x: 32, y: 60 } :
                            play.player === 'west' ? { x: 0, y: 30 } :
                            { x: 64, y: 30 }
                const startX = play.player === 'west' ? '-50px' : play.player === 'east' ? '50px' : '0'
                const startY = play.player === 'north' ? '-50px' : play.player === 'south' ? '50px' : '0'
                return (
                  <div
                    key={getCardKey(play.card)}
                    className="absolute animate-fly-to-center"
                    style={{
                      left: pos.x,
                      top: pos.y,
                    }}
                    // Use CSS custom properties through inline styles
                    {...{'data-start-x': startX, 'data-start-y': startY} as any}
                  >
                    <Card suit={play.card.suit} rank={play.card.rank} className="w-12 h-16" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hearts broken indicator */}
          {heartsBroken && (
            <div className="absolute top-8 right-4 text-xs text-red-300 font-medium" aria-label="Hearts have been broken">
              ♥ Broken
            </div>
          )}

          {/* Message - with accessibility */}
          <div className="absolute bottom-12 left-0 right-0 text-center px-4">
            <div 
              ref={messageRef}
              tabIndex={-1}
              className="inline-block px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm rounded-full font-medium"
              aria-live="polite"
              aria-atomic="true"
            >
              {message}
            </div>
          </div>
        </div>

        {/* User's hand */}
        {(gameState !== 'dealing') && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-center text-green-200 text-sm mb-2 font-medium">
              Your hand ({hands.south.length} cards)
              {heartsBroken && <span className="ml-2 text-red-300">♥</span>}
            </div>
            <div 
              className="flex flex-wrap justify-center gap-0.5"
              role="listbox"
              aria-label="Your cards"
            >
              {sortedHand.map((card, displayIndex) => {
                const originalIndex = hands.south.findIndex(c => 
                  c.suit === card.suit && c.rank === card.rank
                )
                const isValid = gameState === 'playing' && canPlayCard(card, hands.south)
                const isDisabled = gameState !== 'playing' || !isValid
                return (
                  <button
                    key={getCardKey(card)}
                    onClick={() => handleUserCardClick(originalIndex)}
                    disabled={isDisabled}
                    className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-3 hover:scale-105 cursor-pointer'
                    } ${currentTrick.length > 0 && currentTrick[0].player === 'south' ? '' : ''}`}
                    style={{ marginLeft: displayIndex > 0 ? '-16px' : '0', zIndex: displayIndex }}
                    type="button"
                    role="option"
                    aria-selected="false"
                    aria-disabled={isDisabled}
                    aria-label={`${card.rank} of ${card.suit}${isValid ? ', playable' : ', cannot play'}`}
                  >
                    <Card 
                      suit={card.suit} 
                      rank={card.rank} 
                      className={`w-14 h-19 sm:w-16 sm:h-22 ${!isValid && currentTrick.length > 0 ? 'grayscale' : ''}`}
                    />
                  </button>
                )
              })}
            </div>
            {currentTrick.length > 0 && currentTrick[0].player !== 'south' && gameState === 'playing' && (
              <div className="text-center text-xs text-yellow-300 mt-2 font-medium">
                Must follow {currentTrick[0].card.suit} if possible
              </div>
            )}
          </div>
        )}

        {/* Game over */}
        {gameState === 'finished' && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <h3 className="text-white font-semibold text-lg mb-3">Game Complete!</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="text-green-200">North: {scores.north} pts</div>
              <div className="text-green-200">East: {scores.east} pts</div>
              <div className="text-green-200">South: {scores.south} pts</div>
              <div className="text-green-200">West: {scores.west} pts</div>
            </div>
            <p className="text-xs text-green-300 mb-3">
              {scores.south === Math.min(...Object.values(scores)) 
                ? '🎉 You won!' 
                : 'Lower score is better in Hearts'}
            </p>
            <button 
              ref={playAgainRef}
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white rounded-lg font-semibold transition-colors"
              type="button"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
