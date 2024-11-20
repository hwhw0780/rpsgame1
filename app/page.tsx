'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

type GameMode = 
  | 'idle' 
  | 'pvp' 
  | 'pvb' 
  | 'betting' 
  | 'battling' 
  | 'withdrawing' 
  | 'result' 
  | 'depositing'
  | 'pvp_queuing'
  | 'changing_password'
type Choice = 'rock' | 'paper' | 'scissors'
type GameResult = 'win' | 'lose' | 'draw' | null
type BetType = 'win_loss' | 'draw'
type PVPSegment = 100 | 500 | 1000 | 2000 | 5000 | 20000

const choiceEmoji: Record<Choice, string> = {
  rock: '/7.png',
  paper: '/8.png',
  scissors: '/9.png'
}

const choices: Choice[] = ['rock', 'paper', 'scissors']
const maxGamesPerDay = 50

const randomUsernames = [
  "CryptoKing", "LuckyPlayer", "ProGamer123", "RichieRich", 
  "WinMaster", "FortuneSeeker", "CoinHunter", "LuckyDragon",
  "GoldRush", "DiamondHands", "MoonShot", "StarPlayer",
  "VictoryRoyal", "ChampionX", "TopDog", "EliteGamer",
  "AcePlayer", "RocketMan", "NinjaTrader", "BullRunner"
]

const getRandomUsername = () => {
  return randomUsernames[Math.floor(Math.random() * randomUsernames.length)]
}

const getRandomQueueTime = () => {
  return Math.floor(Math.random() * 26) + 5 // Random time between 5-30 seconds
}

interface GameState {
  balancePoints: number
  playablePoints: number
  withdrawablePoints: number
  gameMode: GameMode
  result: string | null
  playerChoice: Choice | null
  botChoice: Choice | null
  gameResult: GameResult
  betAmount: number
  withdrawAmount: number
  gamesPlayed: number
  lastResetDate: string
  dailyTurnover: number
  betType: BetType | null
  depositAmount: number
  pvpSegment: PVPSegment | null
  opponent: string | null
  queueTimeLeft: number | null
  onlinePlayers: OnlinePlayers
  moveTimer: number | null
  usdMyrRate: number
  rateHistory: { time: string; rate: number }[]
  showContactSupport: boolean
  stakingOption: number | null
  stakingAmount: number
  showStakingModal: boolean
}

const getRandomChoice = (): Choice => {
  return choices[Math.floor(Math.random() * choices.length)]
}

const determineWinner = (playerChoice: Choice, botChoice: Choice): 'win' | 'lose' | 'draw' => {
  if (playerChoice === botChoice) return 'draw'
  if (
    (playerChoice === 'rock' && botChoice === 'scissors') ||
    (playerChoice === 'paper' && botChoice === 'rock') ||
    (playerChoice === 'scissors' && botChoice === 'paper')
  ) {
    return 'win'
  }
  return 'lose'
}

const getWinAnimation = (choice: Choice): string => {
  switch (choice) {
    case 'rock': return 'animate-rock-win'
    case 'paper': return 'animate-paper-win'
    case 'scissors': return 'animate-scissors-win'
    default: return ''
  }
}

// Add this function to generate random player count within a range
const getRandomPlayerCount = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Add this to track online players for each segment
interface OnlinePlayers {
  [key: number]: number
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Game() {
  const initialState: GameState = {
    balancePoints: 40000,
    playablePoints: 10000,
    withdrawablePoints: 0,
    gameMode: 'idle',
    result: null,
    playerChoice: null,
    botChoice: null,
    gameResult: null,
    betAmount: 100,
    withdrawAmount: 0,
    gamesPlayed: 0,
    lastResetDate: new Date().toDateString(),
    dailyTurnover: 0,
    betType: null,
    depositAmount: 0,
    pvpSegment: null,
    opponent: null,
    queueTimeLeft: null,
    onlinePlayers: {
      100: getRandomPlayerCount(20, 600),
      500: getRandomPlayerCount(20, 600),
      1000: getRandomPlayerCount(20, 100),
      2000: getRandomPlayerCount(2, 50),
      5000: getRandomPlayerCount(2, 300),
      20000: getRandomPlayerCount(2, 10)
    },
    moveTimer: null,
    usdMyrRate: 4.72,
    rateHistory: Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.now() - i * 30000).toLocaleTimeString(),
      rate: 4.72 + (Math.random() * 0.1 - 0.05)
    })).reverse(),
    showContactSupport: false,
    stakingOption: null,
    stakingAmount: 0,
    showStakingModal: false
  }

  const [state, setState] = useState<GameState>(initialState)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = '/login'
      return
    }

    // Initialize game state with user data
    const userData = JSON.parse(user)
    setState(prev => ({
      ...prev,
      balancePoints: userData.balancePoints,
      playablePoints: userData.playablePoints,
      withdrawablePoints: userData.withdrawablePoints
    }))
  }, [])

  useEffect(() => {
    const today = new Date().toDateString()
    if (today !== state.lastResetDate) {
      console.log('Resetting daily values')  // Debug log
      setState(prev => ({
        ...prev,
        playablePoints: 10000,
        withdrawablePoints: 0,
        gamesPlayed: 0,
        lastResetDate: today,
        dailyTurnover: 0
      }))
    }
  }, [state.lastResetDate])

  useEffect(() => {
    localStorage.setItem('balancePoints', state.balancePoints.toString())
    localStorage.setItem('playablePoints', state.playablePoints.toString())
    localStorage.setItem('gamesPlayed', state.gamesPlayed.toString())
    localStorage.setItem('lastResetDate', state.lastResetDate)
    localStorage.setItem('dailyTurnover', state.dailyTurnover.toString())
  }, [state.balancePoints, state.playablePoints, state.gamesPlayed, 
      state.lastResetDate, state.dailyTurnover])

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        onlinePlayers: {
          100: getRandomPlayerCount(20, 600),
          500: getRandomPlayerCount(20, 600),
          1000: getRandomPlayerCount(20, 100),
          2000: getRandomPlayerCount(2, 50),
          5000: getRandomPlayerCount(2, 300),
          20000: getRandomPlayerCount(2, 10)
        }
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newRate = prev.usdMyrRate + (Math.random() * 0.02 - 0.01)
        const newHistory = [...prev.rateHistory.slice(1), {
          time: new Date().toLocaleTimeString(),
          rate: newRate
        }]
        return {
          ...prev,
          usdMyrRate: newRate,
          rateHistory: newHistory
        }
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handlePVB = () => {
    if (state.result || state.gameResult) {
      resetGame()
    }
    setState(prev => ({
      ...prev,
      gameMode: 'betting',
      result: "Place your bet!",
      playerChoice: null,
      botChoice: null,
      gameResult: null
    }))
  }

  const handleBet = () => {
    console.log('HandleBet called', { 
      betType: state.betType, 
      betAmount: state.betAmount, 
      playablePoints: state.playablePoints 
    })  // Debug log

    if (!state.betType) {
      toast({
        title: "Select Bet Type",
        description: "Please select either Win/Loss or Draw bet type.",
        variant: "destructive"
      })
      return
    }

    if (state.betAmount <= 0 || state.betAmount > state.playablePoints) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid amount from your playable points.",
        variant: "destructive"
      })
      return
    }

    console.log('Setting game mode to pvb')  // Debug log
    setState(prev => ({
      ...prev,
      playablePoints: prev.playablePoints - prev.betAmount,
      gameMode: 'pvb',
      playerChoice: null,
      botChoice: null,
      gameResult: null,
      result: "Choose your move!"
    }))
  }

  const playGame = (choice: Choice) => {
    console.log('PlayGame called with choice:', choice)
    
    console.log('Setting player choice and battle mode')
    setState(prev => ({
      ...prev,
      playerChoice: choice,
      gameMode: 'battling',
      moveTimer: null
    }))

    setTimeout(() => {
      console.log('First timeout - calculating bot choice')
      const bot = getRandomChoice()
      const result = determineWinner(choice, bot)
      
      console.log('Bot chose:', bot, 'Result:', result)
      
      setState(prev => {
        console.log('Updating state with game result')
        let winnings = 0
        if (prev.betType === 'draw') {
          winnings = result === 'draw' ? Math.floor(prev.betAmount * 2.89) : 0
        } else {
          winnings = result === 'win' ? prev.betAmount * 2 :
                    result === 'draw' ? prev.betAmount : 0
        }

        const newPlayablePoints = prev.playablePoints + winnings
        const newDailyTurnover = prev.dailyTurnover + prev.betAmount

        return {
          ...prev,
          botChoice: bot,
          gameResult: result,
          playablePoints: newPlayablePoints,
          withdrawablePoints: newDailyTurnover >= 10000 ? newPlayablePoints : 0,
          gamesPlayed: prev.gamesPlayed + 1,
          dailyTurnover: newDailyTurnover
        }
      })

      setTimeout(() => {
        console.log('Second timeout - showing result screen')
        setState(prev => ({
          ...prev,
          gameMode: 'result',
          result: `You ${result}!`
        }))
      }, 5000)
    }, 2500)
  }

  const handleWithdraw = () => {
    setState(prev => ({
      ...prev,
      gameMode: 'withdrawing',
      result: "Enter withdrawal amount",
      withdrawAmount: 0
    }))
  }

  const processWithdrawal = () => {
    if (state.withdrawAmount <= 0 || state.withdrawAmount > state.withdrawablePoints) {
      toast({
        title: "Invalid withdrawal amount",
        description: "Please enter a valid amount from your withdrawable points.",
        variant: "destructive"
      })
      return
    }

    setState(prev => ({
      ...prev,
      balancePoints: prev.balancePoints + prev.withdrawAmount,
      playablePoints: prev.playablePoints - prev.withdrawAmount,
      withdrawablePoints: prev.withdrawablePoints - prev.withdrawAmount,
      gameMode: 'idle',
      result: null,
      withdrawAmount: 0
    }))

    toast({
      title: "Withdrawal Successful",
      description: `You have withdrawn ${state.withdrawAmount} points to your balance.`
    })
  }

  const handlePVP = () => {
    setState(prev => ({
      ...prev,
      gameMode: 'pvp',
      result: "Select betting segment"
    }))
  }

  const resetGame = () => {
    setState(prev => ({
      ...prev,
      gameMode: 'idle',
      playerChoice: null,
      botChoice: null,
      gameResult: null,
      result: null,
      betAmount: 100,
      betType: null
    }))
  }

  const handleDeposit = () => {
    const maxDeposit = Math.floor(state.balancePoints * 0.05) // 5% of balance points
    
    setState(prev => ({
      ...prev,
      gameMode: 'depositing',
      result: `You can deposit up to ${maxDeposit} points (5% of balance)`
    }))
  }

  const processDeposit = (amount: number) => {
    const maxDeposit = Math.floor(state.balancePoints * 0.05)
    
    if (amount <= 0 || amount > maxDeposit) {
      toast({
        title: "Invalid deposit amount",
        description: `Please enter an amount between 1 and ${maxDeposit} points.`,
        variant: "destructive"
      })
      return
    }

    setState(prev => ({
      ...prev,
      balancePoints: prev.balancePoints - amount,
      playablePoints: prev.playablePoints + amount,
      gameMode: 'idle',
      result: null
    }))

    toast({
      title: "Deposit Successful",
      description: `You have deposited ${amount} points to your playable balance.`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="flex gap-8 justify-center">
        <Card className="w-[400px] bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
              Finance Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 bg-black/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Balance Points:</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {state.balancePoints}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Points in USDT:</span>
                <span className="text-2xl font-bold text-green-400">
                  {(state.balancePoints / 18).toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">USDT in MYR:</span>
                <span className="text-2xl font-bold text-blue-400">
                  {((state.balancePoints / 18) * state.usdMyrRate).toFixed(2)} MYR
                </span>
              </div>
            </div>

            <div className="h-[200px] bg-black/20 p-4 rounded-lg">
              <Line
                data={{
                  labels: state.rateHistory.map(item => item.time),
                  datasets: [
                    {
                      label: 'USD/MYR',
                      data: state.rateHistory.map(item => item.rate),
                      borderColor: '#4ade80',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      ticks: { color: '#ffffff80' },
                      grid: { color: '#ffffff20' }
                    },
                    x: {
                      ticks: { color: '#ffffff80' },
                      grid: { color: '#ffffff20' }
                    }
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button 
                onClick={() => handleDeposit()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Deposit
              </Button>
              <Button 
                onClick={() => handleWithdraw()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Withdraw
              </Button>
              <Button 
                onClick={() => setState(prev => ({ ...prev, showStakingModal: true }))}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Stake
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-[600px] bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="space-y-4">
            <CardTitle className="text-center text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              Rock Paper Scissors
            </CardTitle>
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-black/20">
              <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
                <p className="text-sm text-gray-300">Balance Points</p>
                <p className="text-2xl font-bold text-yellow-400">{state.balancePoints}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur relative">
                <p className="text-sm text-gray-300">Playable Points</p>
                <p className="text-2xl font-bold text-green-400">{state.playablePoints}</p>
                <Button
                  onClick={handleDeposit}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 p-0 text-white font-bold"
                >
                  +
                </Button>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
                <p className="text-sm text-gray-300">Withdrawable Points</p>
                <p className="text-2xl font-bold text-blue-400">{state.withdrawablePoints}</p>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400">
              Daily Turnover: {state.dailyTurnover}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {state.gameMode === 'idle' && (
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handlePVP}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-bold transform hover:scale-105 transition-all"
                >
                  PVP Mode
                </Button>
                <Button 
                  onClick={handlePVB}
                  className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white py-6 text-lg font-bold transform hover:scale-105 transition-all"
                >
                  Play vs Bot
                </Button>
                <Button 
                  onClick={handleWithdraw}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-6 text-lg font-bold transform hover:scale-105 transition-all"
                >
                  Withdraw Points
                </Button>
              </div>
            )}

            {state.gameMode === 'betting' && (
              <div className="space-y-4 bg-black/20 p-6 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="bet-amount" className="text-gray-200">Bet Amount</Label>
                  <Input
                    id="bet-amount"
                    type="number"
                    value={state.betAmount}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      betAmount: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                    min={1}
                    max={state.playablePoints}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Bet Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => setState(prev => ({ ...prev, betType: 'win_loss' }))}
                      className={`py-6 text-lg font-bold ${
                        state.betType === 'win_loss' 
                          ? 'bg-gradient-to-r from-green-600 to-blue-600'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl">Win/Loss</div>
                        <div className="text-sm text-gray-300">x2 on win</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => setState(prev => ({ ...prev, betType: 'draw' }))}
                      className={`py-6 text-lg font-bold ${
                        state.betType === 'draw' 
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl">Draw</div>
                        <div className="text-sm text-gray-300">x2.89 on draw</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleBet} 
                  disabled={!state.betType}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg font-bold disabled:opacity-50"
                >
                  Place Bet
                </Button>
              </div>
            )}

            {state.gameMode === 'pvb' && (
              <div className="flex justify-center space-x-8 mt-8">
                {choices.map(choice => (
                  <Button
                    key={choice}
                    onClick={() => {
                      console.log('Choice button clicked:', choice)  // Debug log
                      console.log('Current state:', state)  // Debug log
                      playGame(choice)
                    }}
                    className="w-32 h-32 p-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-2xl transform hover:scale-110 transition-all"
                    disabled={!!state.playerChoice}
                  >
                    <img 
                      src={choiceEmoji[choice]} 
                      alt={choice}
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </Button>
                ))}
              </div>
            )}

            {(state.gameMode === 'battling' || state.gameMode === 'pvb') && (
              <div className="relative py-8">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent blur-xl"></div>
                
                <div className="relative flex justify-center items-center space-x-16 mt-8">
                  {/* Player Side */}
                  <div className="text-center transform transition-all duration-500">
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                      <img 
                        src="/11.png" 
                        alt="You" 
                        className="w-20 h-20 mx-auto rounded-full border-4 border-blue-500 relative z-10"
                      />
                      <p className="text-xl font-bold mt-2 text-blue-400">You</p>
                    </div>
                    
                    {state.playerChoice && (
                      <div className={`relative transition-all duration-500 ${
                        state.gameMode === 'battling' ? 'animate-battle-hover' :
                        state.gameResult === 'win' ? 'animate-winner-kick' : 
                        state.gameResult === 'lose' ? 'animate-loser-kicked' : ''
                      }`}>
                        <img 
                          src={choiceEmoji[state.playerChoice]} 
                          alt={state.playerChoice}
                          className={`w-48 h-48 object-contain ${
                            state.gameMode === 'battling' ? 'animate-battle-shake' : ''
                          }`}
                        />
                        {state.gameResult === 'win' && (
                          <div className="absolute -top-8 -right-8 bg-green-500 text-white rounded-full p-3 animate-bounce text-lg font-bold">
                            Winner!
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* VS Display */}
                  <div className="relative">
                    <div className={`text-7xl font-bold ${
                      state.gameMode === 'battling' ? 'animate-vs-pulse' : ''
                    }`}>
                      <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-transparent bg-clip-text">
                        VS
                      </span>
                    </div>
                    
                    {state.gameMode === 'battling' && (
                      <>
                        {/* Lightning Effects - removed the horizontal line */}
                        <div className="absolute -inset-4 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce">
                          ⚡
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce delay-300">
                          ⚡
                        </div>
                      </>
                    )}
                  </div>

                  {/* Opponent Side */}
                  <div className="text-center transform transition-all duration-500">
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
                      <img 
                        src="/10.png" 
                        alt={state.opponent || 'Bot'} 
                        className="w-20 h-20 mx-auto rounded-full border-4 border-red-500 relative z-10"
                      />
                      <p className="text-xl font-bold mt-2 text-red-400">
                        {state.opponent || 'Bot'}
                      </p>
                    </div>
                    
                    {state.botChoice && (
                      <div className={`relative transition-all duration-500 ${
                        state.gameMode === 'battling' ? 'animate-battle-hover' :
                        state.gameResult === 'lose' ? 'animate-winner-kick' : 
                        state.gameResult === 'win' ? 'animate-loser-kicked' : ''
                      }`}>
                        <img 
                          src={choiceEmoji[state.botChoice]} 
                          alt={state.botChoice}
                          className={`w-48 h-48 object-contain ${
                            state.gameMode === 'battling' ? 'animate-battle-shake' : ''
                          }`}
                        />
                        {state.gameResult === 'lose' && (
                          <div className="absolute -top-8 -right-8 bg-green-500 text-white rounded-full p-3 animate-bounce text-lg font-bold">
                            Winner!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.gameMode === 'withdrawing' && (
              <div className="space-y-4 bg-black/20 p-6 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount" className="text-gray-200">Withdrawal Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    value={state.withdrawAmount}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      withdrawAmount: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                    min={1}
                    max={state.withdrawablePoints}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button 
                  onClick={processWithdrawal} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg font-bold"
                >
                  Confirm Withdrawal
                </Button>
                <Button 
                  onClick={() => setState(prev => ({ ...prev, gameMode: 'idle' }))} 
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                >
                  Cancel
                </Button>
              </div>
            )}

            {state.gameMode === 'result' && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl border border-white/20 shadow-xl max-w-md w-full mx-4">
                  <div className="text-center space-y-6">
                    {/* Result Icon */}
                    <div className="text-8xl animate-bounce">
                      {state.gameResult === 'win' ? '🏆' : state.gameResult === 'lose' ? '😢' : '🤝'}
                    </div>
                    
                    {/* Result Title */}
                    <h2 className={`text-4xl font-bold ${
                      state.gameResult === 'win' ? 'text-green-400' : 
                      state.gameResult === 'lose' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {state.gameResult === 'win' ? 'Congratulations!' :
                       state.gameResult === 'lose' ? 'Oops!' :
                       'Draw!'}
                    </h2>

                    {/* Points Change */}
                    <div className="text-2xl font-semibold">
                      {state.betType === 'draw' ? (
                        // Messages for Draw bet type
                        state.gameResult === 'draw' ? (
                          <p className="text-green-400">
                            You won {Math.floor(state.betAmount * 2.89)} points!
                          </p>
                        ) : (
                          <p className="text-red-400">
                            You lost {state.betAmount} points
                          </p>
                        )
                      ) : (
                        // Messages for Win/Loss bet type
                        state.gameResult === 'win' ? (
                          <p className="text-green-400">
                            You won {state.betAmount * 2} points!
                          </p>
                        ) : state.gameResult === 'lose' ? (
                          <p className="text-red-400">
                            You lost {state.betAmount} points
                          </p>
                        ) : (
                          <p className="text-yellow-400">
                            Your bet has been returned
                          </p>
                        )
                      )}
                    </div>

                    {/* Current Balance */}
                    <div className="text-gray-300">
                      Current Playable Points: {state.playablePoints}
                    </div>

                    {/* Home Button */}
                    <Button 
                      onClick={resetGame}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 text-lg font-bold rounded-full transform hover:scale-105 transition-all"
                    >
                      Play Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {state.gameMode === 'depositing' && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl border border-white/20 shadow-xl max-w-md w-full mx-4">
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white">Deposit to Balance</h2>
                    
                    <div className="space-y-4">
                      {/* Crypto Address */}
                      <div className="bg-black/30 p-4 rounded-lg space-y-2">
                        <Label className="text-gray-400">USDT Address (BEP20)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value="0xE53F0c56b196724ec1615f7CbE3303690B9D7320"
                            readOnly
                            className="bg-black/20 border-white/10 text-white font-mono text-sm"
                          />
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText("0xE53F0c56b196724ec1615f7CbE3303690B9D7320")
                              toast({
                                title: "Address Copied",
                                description: "The deposit address has been copied to your clipboard."
                              })
                            }}
                            variant="outline"
                            className="shrink-0"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-2">
                        <Label className="text-gray-200">Deposit Amount (USDT)</Label>
                        <Input
                          type="number"
                          value={state.depositAmount || ''}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            depositAmount: Math.max(0, parseFloat(e.target.value) || 0)
                          }))}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="Enter amount in USDT"
                        />
                        <p className="text-sm text-gray-400 text-left">
                          You will receive {((state.depositAmount || 0) * 18).toFixed(0)} Balance Points
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={() => {
                            // Here you would typically integrate with your payment system
                            toast({
                              title: "Deposit Request Sent",
                              description: "Please contact customer service to confirm your deposit."
                            })
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-lg font-bold"
                        >
                          Submit Deposit Request
                        </Button>
                        
                        <Button
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            showContactSupport: true 
                          }))}
                          variant="outline"
                          className="w-full"
                        >
                          Contact Customer Service
                        </Button>
                        
                        <Button
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            gameMode: 'idle',
                            depositAmount: 0
                          }))}
                          variant="outline"
                          className="w-full bg-red-500/10 hover:bg-red-500/20"
                        >
                          Cancel
                        </Button>
                      </div>

                      {/* Notes */}
                      <div className="text-sm text-gray-400 text-left space-y-1">
                        <p>• Minimum deposit: 10 USDT</p>
                        <p>• Only send USDT (BEP20) to this address</p>
                        <p>• Contact customer service after making deposit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.gameMode === 'pvp' && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl border border-white/20 shadow-xl max-w-md w-full mx-4">
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Betting Segment</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[100, 500, 1000, 2000, 5000, 20000].map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => {
                            if (state.playablePoints < amount) {
                              toast({
                                title: "Insufficient Points",
                                description: `You need at least ${amount} points to join this segment.`,
                                variant: "destructive"
                              })
                              return
                            }

                            const queueTime = getRandomQueueTime()
                            const opponent = getRandomUsername()
                            const matchFoundTime = Math.min(5, Math.floor(queueTime / 3)) // Match found earlier

                            setState(prev => ({
                              ...prev,
                              pvpSegment: amount as PVPSegment,
                              gameMode: 'pvp_queuing',
                              result: "Finding opponent...",
                              queueTimeLeft: queueTime,
                              opponent: null
                            }))

                            // Start queue countdown
                            const queueInterval = setInterval(() => {
                              setState(prev => ({
                                ...prev,
                                queueTimeLeft: prev.queueTimeLeft! - 1,
                                result: `Finding opponent... ${prev.queueTimeLeft}s`
                              }))
                            }, 1000)

                            // Find opponent earlier
                            setTimeout(() => {
                              clearInterval(queueInterval)
                              setState(prev => ({
                                ...prev,
                                opponent,
                                result: `Matched with ${opponent}!`,
                                playablePoints: prev.playablePoints - amount,
                                betAmount: amount
                              }))

                              // Start game after showing opponent
                              setTimeout(() => {
                                setState(prev => ({
                                  ...prev,
                                  gameMode: 'pvb',
                                  result: "Choose your move! (5s)",
                                  moveTimer: 5
                                }))

                                // Start move timer
                                const moveInterval = setInterval(() => {
                                  setState(prev => {
                                    if (prev.moveTimer === 1) {
                                      clearInterval(moveInterval)
                                      // Make random move if player hasn't chosen
                                      if (!prev.playerChoice) {
                                        const randomChoice = getRandomChoice()
                                        playGame(randomChoice)
                                      }
                                      return prev
                                    }
                                    return {
                                      ...prev,
                                      moveTimer: prev.moveTimer ? prev.moveTimer - 1 : null,
                                      result: `Choose your move! (${prev.moveTimer! - 1}s)`
                                    }
                                  })
                                }, 1000)
                              }, 2000)
                            }, matchFoundTime * 1000) // Use shorter time for match finding
                          }}
                          className={`py-6 text-lg font-bold bg-gradient-to-r 
                            ${amount <= 1000 
                              ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                              : amount <= 5000 
                                ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            } transform hover:scale-105 transition-all relative`}
                          disabled={state.playablePoints < amount}
                        >
                          <div className="text-center w-full">
                            <div className="text-2xl">{amount} points</div>
                          </div>
                        </Button>
                      ))}
                    </div>

                    <Button 
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        gameMode: 'idle',
                        queueTimeLeft: null,
                        opponent: null 
                      }))}
                      className="w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {state.gameMode === 'pvp_queuing' && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl border border-white/20 shadow-xl max-w-md w-full mx-4 relative">
                  {/* Add online players count to top right */}
                  <div className="absolute top-4 right-4 text-sm bg-green-500/20 px-3 py-1 rounded-full">
                    <span className="relative inline-flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {state.onlinePlayers[state.pvpSegment!]} online
                  </div>

                  <div className="text-center space-y-6">
                    <div className="animate-spin text-4xl mb-4">🔄</div>
                    <h2 className="text-2xl font-bold text-white">
                      {state.opponent ? 
                        `Matched with ${state.opponent}!` : 
                        `Finding opponent... ${state.queueTimeLeft}s`
                      }
                    </h2>
                    {!state.opponent && (
                      <>
                        <Progress 
                          value={((getRandomQueueTime() - (state.queueTimeLeft || 0)) / getRandomQueueTime()) * 100} 
                          className="mt-4"
                        />
                        <Button
                          onClick={() => {
                            // Clear any existing intervals
                            const intervals = window.setInterval(() => {}, 9999);
                            for (let i = 0; i < intervals; i++) {
                              window.clearInterval(i);
                            }
                            
                            setState(prev => ({
                              ...prev,
                              gameMode: 'idle',
                              queueTimeLeft: null,
                              opponent: null,
                              pvpSegment: null,
                              // Restore points if they were deducted
                              playablePoints: prev.playablePoints + (prev.betAmount || 0),
                              betAmount: 100
                            }))
                          }}
                          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                        >
                          Cancel Matchmaking
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.gameMode === 'pvb' && !state.playerChoice && state.moveTimer && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="text-xl font-bold text-red-500 animate-pulse">
                  {state.moveTimer}s
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-white/80 font-semibold">
                  Welcome, {JSON.parse(localStorage.getItem('user') || '{}').username}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setState(prev => ({
                      ...prev,
                      gameMode: 'changing_password'
                    }))}
                    variant="outline"
                    className="bg-yellow-500/10 hover:bg-yellow-500/20"
                    size="sm"
                  >
                    Change Password
                  </Button>
                  <Button 
                    onClick={() => {
                      localStorage.removeItem('user')
                      window.location.href = '/login'
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/10 hover:bg-red-500/20"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 