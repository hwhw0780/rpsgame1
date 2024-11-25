'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { generateRandomUsername } from '@/utils/nameGenerator'
import { Line } from 'react-chartjs-2'
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type Choice = 'rock' | 'paper' | 'scissors'
type GameResult = 'win' | 'lose' | 'draw' | null
type PVPSegment = 100 | 500 | 1000 | 2000 | 5000 | 20000
type QuestStatus = 'unclaimed' | 'pending' | 'verified' | 'completed';

interface StakingPackage {
  duration: number
  apr: number
  penalty: number
}

interface StakedAmount {
  amount: number
  startDate: string
  duration: number
  apr: number
  penalty: number
}

// Add this to GameState interface
interface CurrencyRate {
  rate: number
  history: { time: string; rate: number }[]
}

interface GameState {
  gameMode: string
  pvpSegment: PVPSegment | null
  queueTimeLeft: number | null
  opponent: string | null
  opponentHistory: Choice[]
  playerChoice: Choice | null
  botChoice: Choice | null
  gameResult: GameResult
  betAmount: number
  rpsCoins: number
  stakingRPS: number
  usdtBalance: number
  currentGameNo: string | null
  moveTimeLeft: number | null
  gamesPlayed: number
  selectedCurrency: string
  currencyRates: {
    [key: string]: CurrencyRate
  }
  onlinePlayers: {
    [key: number]: number  // This allows any number as key
  }
  questStatus: {
    telegram: QuestStatus
    twitter_share: QuestStatus
    twitter_like: QuestStatus
    lastTwitterShareClaim: string | null
    daily_rewards: QuestStatus
    lastDailyRewardsClaim: string | null
  }
  lastRPStoERPSSwap: string | null
  dailyRPStoERPSLimit: number
  swapDialogOpen: {
    rpsToUsdt: boolean
    usdtToRps: boolean
  }
  swapAmount: string
  eRPS: number               // Total eRPS balance
  withdrawableERPS: number   // Withdrawable eRPS from wins
  stakingPackages: {
    [key: number]: StakingPackage
  }
  stakedAmounts: StakedAmount[]
  stakingDialogOpen: boolean
  selectedStakingPackage: {
    days: number;
    apr: number;
    penalty: number;
  } | null;
  stakingAmount: string;
  unstakeDialogOpen: boolean
  estimatedQueueTime: number | null
  opponentFound: boolean
  choiceTimeLeft: number | null
}

const generateGameNo = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const getRandomChoice = (): Choice => {
  const choices: Choice[] = ['rock', 'paper', 'scissors']
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

const choices: Choice[] = ['rock', 'paper', 'scissors']
const choiceImages = {
  rock: '/15.png',
  paper: '/16.png',
  scissors: '/14.png'
}

// Add this after your existing imports
const teamMembers = [
  {
    name: "John Smith",
    role: "Founder & CEO",
    image: "/team/1.png",
    social: {
      type: "linkedin",
      url: "https://linkedin.com/in/johnsmith"
    }
  },
  {
    name: "Sarah Chen",
    role: "Chief Technology Officer",
    image: "/team/2.png",
    social: null
  },
  {
    name: "Farbod",
    role: "Game Developer",
    image: "/team/3.png",
    social: {
      type: "linkedin",
      url: "https://www.linkedin.com/in/farbodhadighanavat/"
    }
  },
  {
    name: "Emma Watson",
    role: "Frontend Developer",
    image: "/team/4.png",
    social: null
  },
  {
    name: "Lynda",
    role: "UI/UX Designer",
    image: "/team/5.png",
    social: {
      type: "linkedin",
      url: "https://www.linkedin.com/in/lyndamcd/?originalSubdomain=mt"
    }
  },
  {
    name: "Lisa Wang",
    role: "Marketing Director",
    image: "/team/6.png",
    social: null
  },
  {
    name: "Chase Luo",
    role: "Marketing",
    image: "/team/7.png",
    social: {
      type: "linkedin",
      url: "https://www.linkedin.com/in/chase-luo-a27937281/"
    }
  },
];

// Add this near your other constants at the top
const botNames = [
  'Alice', 'Bob', 'Charlie', 'David', 'Emma', 
  'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
  'Kelly', 'Liam', 'Mia', 'Noah', 'Olivia',
  'Peter', 'Quinn', 'Ruby', 'Sam', 'Tara'
];

const getRandomBotName = (): string => {
  return `Bot ${botNames[Math.floor(Math.random() * botNames.length)]}`;
}

// Add this near your other constants
const playerNames = [
  'zongzhen', 'yinmonster', 'code7670', 'zhangmagic', 'treeyong8776',
  'moon9326', 'darkling2924', 'cryptowei4489', 'dreamxin2163', 'fangmagic',
  'happy137', 'pingstar', 'dream6468', 'zongsuper', 'yuyun',
  'hongmagic', 'speed1341', 'hot5738', 'codexi4102', 'yourmamacheng7217',
  'dreamshan4479', 'yongfrost', 'xiahappy', 'longbo', 'superjia758',
  'longyin', 'sun264', 'yongwei', 'rocksong8152', 'monsteryin6648',
  'shadowlei6045', 'shancheng', 'crypto4684', 'fire8112', 'haohui',
  'frost1418', 'tingsun', 'tree1332', 'fire7294', 'yinwei',
  'stormjun4354', 'mingstorm', 'mingyun', 'monsterlei5296', 'xilegend',
  'codeyuan9792', 'crazylong4493', 'xiaoyu', 'xinxi', 'fengchaos'
];

const getRandomPlayerName = (): string => {
  return playerNames[Math.floor(Math.random() * playerNames.length)];
}

// Add this helper function to generate sample data
const generateSampleRateHistory = (baseRate: number) => {
  const history = [];
  const now = new Date();
  
  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5000); // Changed from 5 minutes to 5 seconds
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    history.push({
      time: time.toISOString(),
      rate: baseRate * (1 + variation)
    });
  }
  return history;
};

// Add this function to fetch currency rates
const fetchCurrencyRates = async () => {
  try {
    const currencies = ['CNY', 'CAD', 'AUD', 'MYR'];
    const rates: { [key: string]: CurrencyRate } = {};

    for (const currency of currencies) {
      const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=USDT&target=${currency}`);
      const data = await response.json();
      
      rates[currency] = {
        rate: parseFloat(data.data.rates[currency]),
        history: generateSampleRateHistory(parseFloat(data.data.rates[currency]))
      };
    }

    return rates;
  } catch (error) {
    console.error('Error fetching rates:', error);
    return null;
  }
};

// Add this helper function to get Coinbase URLs
const getCoinbaseUrl = (currency: string) => {
  switch(currency) {
    case 'CNY':
      return 'https://www.coinbase.com/price/usdt-cny';
    case 'CAD':
      return 'https://www.coinbase.com/price/usdt-cad';
    case 'AUD':
      return 'https://www.coinbase.com/price/usdt-aud';
    case 'MYR':
      return 'https://www.coinbase.com/price/usdt-myr';
    default:
      return 'https://www.coinbase.com/price';
  }
};

export default function Game() {
  const [state, setState] = useState<GameState>({
    gameMode: 'idle',
    pvpSegment: null,
    queueTimeLeft: null,
    opponent: null,
    opponentHistory: [],
    playerChoice: null,
    botChoice: null,
    gameResult: null,
    betAmount: 0,
    rpsCoins: 1000000,
    stakingRPS: 0,
    usdtBalance: 500,
    currentGameNo: null,
    moveTimeLeft: null,
    gamesPlayed: 0,
    selectedCurrency: 'CNY',
    currencyRates: {
      CNY: { rate: 7.23, history: generateSampleRateHistory(7.23) },
      CAD: { rate: 1.35, history: generateSampleRateHistory(1.35) },
      AUD: { rate: 1.52, history: generateSampleRateHistory(1.52) },
      MYR: { rate: 4.72, history: generateSampleRateHistory(4.72) }
    },
    onlinePlayers: {
      100: Math.floor(Math.random() * 50) + 10,    // 100 eRPS room
      500: Math.floor(Math.random() * 40) + 8,     // 500 eRPS room
      1000: Math.floor(Math.random() * 30) + 6,    // 1000 eRPS room
      2000: Math.floor(Math.random() * 20) + 4,    // 2000 eRPS room
      5000: Math.floor(Math.random() * 10) + 2,    // 5000 eRPS room
      20000: Math.floor(Math.random() * 5) + 1     // 20000 eRPS room
    },
    questStatus: {
      telegram: 'unclaimed',
      twitter_share: 'unclaimed',
      twitter_like: 'unclaimed',
      lastTwitterShareClaim: null,
      daily_rewards: 'unclaimed',
      lastDailyRewardsClaim: null
    },
    lastRPStoERPSSwap: null,
    dailyRPStoERPSLimit: 5,
    swapDialogOpen: {
      rpsToUsdt: false,
      usdtToRps: false
    },
    swapAmount: '',
    eRPS: 10000,              // Starting eRPS balance
    withdrawableERPS: 0,      // Initially no withdrawable eRPS
    stakingPackages: {
      [7]: { duration: 7, apr: 35, penalty: 10 },
      [30]: { duration: 30, apr: 55, penalty: 15 },
      [60]: { duration: 60, apr: 105, penalty: 20 },
      [180]: { duration: 180, apr: 135, penalty: 30 },
    },
    stakedAmounts: [],
    stakingDialogOpen: false,
    selectedStakingPackage: null,
    stakingAmount: '',
    unstakeDialogOpen: false,
    estimatedQueueTime: null,
    opponentFound: false,
    choiceTimeLeft: null
  })

  // Update useEffect for currency rates
  useEffect(() => {
    const updateRates = async () => {
      const newRates = await fetchCurrencyRates();
      if (newRates) {
        setState(prev => ({
          ...prev,
          currencyRates: newRates
        }));
      }
    };

    // Initial fetch
    updateRates();

    // Update every 5 seconds
    const interval = setInterval(updateRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePVPSegment = (amount: number) => {
    if (amount > state.eRPS) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${amount} eRPS to join this segment. Your balance: ${state.eRPS} eRPS`,
        variant: "destructive"
      })
      return
    }

    // Generate random times
    const estimatedTime = Math.floor(Math.random() * 10) + 3  // 3-12 seconds
    const actualTime = Math.floor(Math.random() * 5) + 2      // 2-6 seconds
    const opponentName = getRandomPlayerName()

    setState(prev => ({
      ...prev,
      gameMode: 'pvp_queuing',
      pvpSegment: amount as PVPSegment,
      queueTimeLeft: estimatedTime,
      estimatedQueueTime: estimatedTime,
      betAmount: amount,
      opponent: opponentName,
      currentGameNo: generateGameNo(),  // Added game number generation
      opponentHistory: Array.from({ length: 5 }, () => getRandomChoice()),
      opponentFound: false
    }))

    // Show opponent found before actual completion
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        opponentFound: true
      }))
    }, (actualTime - 1) * 1000)

    // Transition to battle after actual time
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        gameMode: 'pvp_battle',
        queueTimeLeft: null,
        estimatedQueueTime: null
      }))
    }, actualTime * 1000)

    // Update queue time countdown
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        queueTimeLeft: prev.queueTimeLeft ? prev.queueTimeLeft - 1 : null
      }))
    }, 1000)

    setTimeout(() => clearInterval(timer), actualTime * 1000)
  }

  const handlePVB = () => {
    setState(prev => ({
      ...prev,
      gameMode: 'betting',
      result: "Place your bet!",
      playerChoice: null,
      botChoice: null,
      gameResult: null,
      betAmount: 100  // Default bet amount
    }))
  }

  const handleBet = () => {
    if (state.betAmount <= 0 || state.betAmount > state.eRPS) {
      toast({
        title: "Invalid bet amount",
        description: `Please enter a valid bet amount (1-${state.eRPS} eRPS)`,
        variant: "destructive"
      })
      return
    }

    setState(prev => ({
      ...prev,
      gameMode: 'pvb',
      currentGameNo: generateGameNo(),
      opponent: getRandomBotName(),  // Changed from 'Bot' to random bot name
      opponentHistory: Array.from({ length: 5 }, () => getRandomChoice())
    }))
  }

  const playGame = (choice: Choice) => {
    if (state.betAmount > state.eRPS) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough eRPS to place this bet",
        variant: "destructive"
      })
      return
    }

    // Store the choice but don't start battle yet
    setState(prev => ({
      ...prev,
      playerChoice: choice,
      eRPS: prev.eRPS - prev.betAmount
    }));

    // Wait for the remaining time before starting battle
    const remainingTime = state.choiceTimeLeft || 0;
    setTimeout(() => {
      // Start battle after countdown finishes
      setState(prev => ({
        ...prev,
        gameMode: 'battling',
        botChoice: null
      }));

      const bot = getRandomChoice()

      // After 2 seconds, show bot's choice
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          botChoice: bot
        }))

        // After another 4 seconds, show the result
        setTimeout(() => {
          const result = determineWinner(choice, bot)
          
          setState(prev => {
            let newWithdrawableERPS = prev.withdrawableERPS
            let newERPS = prev.eRPS

            switch(result) {
              case 'win':
                // PvP: 0.95x win multiplier
                newWithdrawableERPS = prev.withdrawableERPS + Math.floor(prev.betAmount * 1.95)
                break
              case 'draw':
                newERPS = prev.eRPS + prev.betAmount
                break
            }
            
            return {
              ...prev,
              gameResult: result,
              eRPS: newERPS,
              withdrawableERPS: newWithdrawableERPS,
              gamesPlayed: prev.gamesPlayed + 1,
              gameMode: 'result'
            }
          })
        }, 4000)
      }, 2000)
    }, remainingTime * 1000);  // Wait for remaining countdown time
  }

  // First, add a useEffect to handle the verification timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.questStatus.telegram === 'pending' || 
        state.questStatus.twitter_like === 'pending') {
      timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          questStatus: {
            ...prev.questStatus,
            telegram: prev.questStatus.telegram === 'pending' ? 'verified' : prev.questStatus.telegram,
            twitter_like: prev.questStatus.twitter_like === 'pending' ? 'verified' : prev.questStatus.twitter_like
          }
        }));
      }, 50000);
    }

    return () => clearTimeout(timer);
  }, [state.questStatus.telegram, state.questStatus.twitter_like]);

  const canClaimDaily = () => {
    if (!state.questStatus.lastDailyRewardsClaim) return true;
    
    const lastClaim = new Date(state.questStatus.lastDailyRewardsClaim);
    const now = new Date();
    // Check if 24 hours (86400000 milliseconds) have passed
    return now.getTime() - lastClaim.getTime() >= 86400000;
  };

  const canSwapRPStoERPS = () => {
    if (!state.lastRPStoERPSSwap) return true;
    
    const lastSwap = new Date(state.lastRPStoERPSSwap);
    const now = new Date();
    return lastSwap.getDate() !== now.getDate() || 
           lastSwap.getMonth() !== now.getMonth() || 
           lastSwap.getFullYear() !== now.getFullYear();
  };

  const calculateCurrentAPR = () => {
    if (state.stakedAmounts.length === 0) return 0;
    
    const totalStaked = state.stakedAmounts.reduce((sum, stake) => sum + stake.amount, 0);
    const weightedAPR = state.stakedAmounts.reduce((sum, stake) => 
      sum + (stake.amount * stake.apr) / totalStaked, 0
    );
    
    return weightedAPR.toFixed(2);
  };

  const getRemainingStakingDays = () => {
    if (state.stakedAmounts.length === 0) return 0;
    
    const now = new Date();
    const remainingDays = state.stakedAmounts.map(stake => {
      const endDate = new Date(stake.startDate);
      endDate.setDate(endDate.getDate() + stake.duration);
      return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    });
    
    return Math.max(...remainingDays);
  };

  // Add helper function for daily rewards calculation
  const calculateDailyRewards = () => {
    if (state.stakedAmounts.length === 0) return 0;
    
    const dailyRewards = state.stakedAmounts.reduce((sum, stake) => {
      // Calculate yearly rewards: amount * (apr/100)
      const yearlyRewards = stake.amount * (stake.apr / 100);
      // Convert to daily rewards
      const dailyReward = yearlyRewards / 365;
      return sum + dailyReward;
    }, 0);
    
    return dailyRewards;
  };

  const calculateUnstakeReturn = () => {
    if (state.stakedAmounts.length === 0) return 0;
    
    // Find the highest penalty rate from all packages
    const highestPenalty = Math.max(...state.stakedAmounts.map(stake => stake.penalty));
    
    return state.stakedAmounts.reduce((total, stake) => {
      const stakeDuration = Math.floor((new Date().getTime() - new Date(stake.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const isEarlyUnstake = stakeDuration < stake.duration;
      
      if (isEarlyUnstake) {
        // Use the highest penalty rate for all unstaking
        const penaltyAmount = stake.amount * (highestPenalty / 100);
        return total + (stake.amount - penaltyAmount);
      }
      return total + stake.amount;
    }, 0);
  };

  const calculateTotalPenalty = () => {
    if (state.stakedAmounts.length === 0) return 0;
    
    // Find the highest penalty rate from all packages
    const highestPenalty = Math.max(...state.stakedAmounts.map(stake => stake.penalty));
    
    return state.stakedAmounts.reduce((total, stake) => {
      const stakeDuration = Math.floor((new Date().getTime() - new Date(stake.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const isEarlyUnstake = stakeDuration < stake.duration;
      
      if (isEarlyUnstake) {
        // Use the highest penalty rate for all unstaking
        return total + (stake.amount * (highestPenalty / 100));
      }
      return total;
    }, 0);
  };

  // Add this helper function
  const getTimeUntilNextClaim = () => {
    if (!state.questStatus.lastDailyRewardsClaim) return null;
    
    const lastClaim = new Date(state.questStatus.lastDailyRewardsClaim);
    // Add exactly 24 hours to last claim time
    const nextClaim = new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000));
    const now = new Date();
    const diff = nextClaim.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    // Calculate remaining time
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));  // Removed extra )
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Format with leading zeros
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Add this useEffect for countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.questStatus.daily_rewards === 'completed' && !canClaimDaily()) {
      timer = setInterval(() => {
        setState(prev => ({ ...prev })); // Force re-render to update countdown
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [state.questStatus.daily_rewards, canClaimDaily]);

  // Add useEffect for countdown and auto-pick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    if (state.gameMode === 'pvp_battle') {
      // Set initial countdown
      setState(prev => ({ ...prev, choiceTimeLeft: 5, playerChoice: null }));

      // Start countdown
      countdownTimer = setInterval(() => {
        setState(prev => {
          if (prev.choiceTimeLeft === 1) {
            // If time's up and no choice made, make random choice
            if (!prev.playerChoice) {
              const randomChoice = getRandomChoice();
              playGame(randomChoice);
            }
            return { ...prev, choiceTimeLeft: null };
          }
          return {
            ...prev,
            choiceTimeLeft: prev.choiceTimeLeft ? prev.choiceTimeLeft - 1 : null
          };
        });
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [state.gameMode]);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-gray-100 p-2 sm:p-4 md:p-8">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-6">
          <Image 
            src="/rpslogo.png" 
            alt="RPS League" 
            width={60}
            height={60}
            className="animate-flip"
          />
          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            RPS League
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Button 
            onClick={() => window.open('/whitepaper.pdf', '_blank')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
            Whitepaper
          </Button>
          <Button 
            onClick={() => {
              localStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 text-lg"
          >
            Disconnect
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
        {/* Finance Center */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-200 text-transparent bg-clip-text">
              Finance Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Containers */}
            <div className="space-y-3">
              {/* Top Row: eRPS and Withdrawable eRPS */}
              <div className="grid grid-cols-2 gap-3">
                {/* eRPS Balance Container */}
                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-3 backdrop-blur-sm border border-purple-500/20">
                  <div className="text-center">
                    <Label className="text-sm text-purple-200">eRPS Balance</Label>
                    <div className="text-lg font-bold text-purple-400 mt-1">
                      {state.eRPS.toLocaleString()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2 w-full text-xs bg-purple-900/20 border-purple-500/20 hover:bg-purple-900/40 text-purple-400"
                      onClick={() => setState(prev => ({
                        ...prev,
                        swapDialogOpen: { ...prev.swapDialogOpen, rpsToUsdt: true }
                      }))}
                    >
                      Convert to RPS
                    </Button>
                  </div>
                </div>

                {/* Withdrawable eRPS Container */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-3 backdrop-blur-sm border border-green-500/20">
                  <div className="text-center">
                    <Label className="text-sm text-green-200">Withdrawable eRPS</Label>
                    <div className="text-lg font-bold text-green-400 mt-1">
                      {state.withdrawableERPS.toLocaleString()}
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs bg-green-900/20 border-green-500/20 hover:bg-green-900/40 text-green-400"
                      onClick={() => setState(prev => ({
                        ...prev,
                        swapDialogOpen: { ...prev.swapDialogOpen, usdtToRps: true }
                      }))}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Quick Cash Out */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-3 backdrop-blur-sm border border-purple-300/20">
                <div className="text-center">
                  <Label className="text-sm text-purple-200">Quick Cash Out</Label>
                  <div className="text-xs text-gray-400 mt-1">
                    Convert eRPS (60%)
                  </div>
                  <div className="mt-2">
                    <div className="relative max-w-[200px] mx-auto">
                      <Input
                        type="number"
                        placeholder={`Max: ${state.eRPS}`}
                        className="h-7 px-2 text-xs bg-purple-900/20 border-purple-500/30 text-white pr-12"
                        max={state.eRPS}
                        id="swapAmount"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-7 px-2 text-xs bg-purple-900/40 hover:bg-purple-900/60 text-purple-200"
                        onClick={() => {
                          const input = document.getElementById('swapAmount') as HTMLInputElement;
                          input.value = state.eRPS.toString();
                        }}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Deposit USDT
              </Button>
              <Button 
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
              >
                Withdraw USDT
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Staking
              </Button>
            </div>

            {/* Currency Exchange Section */}
            <div className="pt-4">
              <Label className="text-lg font-semibold text-yellow-400 mb-4">Currency Exchange</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {Object.entries(state.currencyRates).map(([currency, data]) => (
                  <div 
                    key={currency}
                    className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600/20 cursor-pointer hover:bg-slate-700/50 transition-all"
                    onClick={() => {
                      window.open(getCoinbaseUrl(currency), '_blank');
                    }}
                  >
                    <div className="text-sm text-gray-400">USDT to {currency}</div>
                    <div className="h-20 mt-2">
                      <Line
                        data={{
                          labels: data.history.map(h => new Date(h.time).toLocaleTimeString()),
                          datasets: [{
                            data: data.history.map(h => h.rate),
                            borderColor: currency === 'CNY' ? '#facc15' :
                                      currency === 'CAD' ? '#ef4444' :
                                      currency === 'AUD' ? '#22c55e' :
                                      '#3b82f6',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0,
                            fill: false
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: true }
                          },
                          scales: {
                            x: { display: false },
                            y: {
                              display: false,
                              min: Math.min(...data.history.map(h => h.rate)) * 0.999,
                              max: Math.max(...data.history.map(h => h.rate)) * 1.001
                            }
                          }
                        }}
                      />
                    </div>
                    <div className={`text-xl font-bold ${
                      currency === 'CNY' ? 'text-yellow-400' :
                      currency === 'CAD' ? 'text-red-400' :
                      currency === 'AUD' ? 'text-green-400' :
                      'text-blue-400'
                    }`}>
                      {currency === 'CNY' ? '¥' :
                       currency === 'CAD' ? 'C$' :
                       currency === 'AUD' ? 'A$' :
                       'RM'} {data.rate.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Arena */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)] hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 text-transparent bg-clip-text">
              RPS Arena
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Containers */}
            <div className="space-y-3">
              {/* Top Row: eRPS and Withdrawable eRPS */}
              <div className="grid grid-cols-2 gap-3">
                {/* eRPS Balance Container */}
                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-3 backdrop-blur-sm border border-purple-500/20">
                  <div className="text-center">
                    <Label className="text-sm text-purple-200">eRPS Balance</Label>
                    <div className="text-lg font-bold text-purple-400 mt-1">
                      {state.eRPS.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Withdrawable eRPS Container */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-3 backdrop-blur-sm border border-green-500/20">
                  <div className="text-center">
                    <Label className="text-sm text-green-200">Withdrawable eRPS</Label>
                    <div className="text-lg font-bold text-green-400 mt-1">
                      {state.withdrawableERPS.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Quick Cash Out */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-3 backdrop-blur-sm border border-purple-300/20">
                <div className="text-center">
                  <Label className="text-sm text-purple-200">Quick Cash Out</Label>
                  <div className="text-xs text-gray-400 mt-1">
                    Convert eRPS (60%)
                  </div>
                  <div className="mt-2">
                    <div className="relative max-w-[200px] mx-auto">
                      <Input
                        type="number"
                        placeholder={`Max: ${state.eRPS}`}
                        className="h-7 px-2 text-xs bg-purple-900/20 border-purple-500/30 text-white pr-12"
                        max={state.eRPS}
                        id="swapAmount"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-7 px-2 text-xs bg-purple-900/40 hover:bg-purple-900/60 text-purple-200"
                        onClick={() => {
                          const input = document.getElementById('swapAmount') as HTMLInputElement;
                          input.value = state.eRPS.toString();
                        }}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handlePVB}
                className="h-32 text-xl bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border border-blue-400/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-200">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <path d="M12 12a2 2 0 0 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                  Play vs Bot
                </div>
              </Button>
              
              <Button 
                onClick={() => setState(prev => ({ ...prev, gameMode: 'pvp' }))}
                className="h-32 text-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-400/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-200">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Play vs Player
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How to Earn Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-slate-900/90 via-indigo-900/90 to-slate-900/90 backdrop-blur-sm border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-400">
              How to Earn with RPS League
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1: Deposit USDT */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="h-32 w-full relative mb-3">
                  <Image
                    src="/33.png"
                    alt="Deposit USDT"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">1. Deposit USDT</h4>
                <p className="text-sm text-gray-400">
                  Start by depositing USDT to your wallet. Quick, secure, and ready for gaming.
                </p>
              </div>

              {/* Step 2: Swap to RPS */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="h-32 w-full relative mb-3">
                  <Image
                    src="/34.png"
                    alt="Swap to RPS"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-green-300 mb-2">2. Swap to RPS</h4>
                <p className="text-sm text-gray-400">
                  Convert your USDT to RPS tokens. Better rates, more gaming power.
                </p>
              </div>

              {/* Step 3: Staking */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="h-32 w-full relative mb-3">
                  <Image
                    src="/35.png"
                    alt="Staking"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-purple-300 mb-2">3. Stake RPS</h4>
                <p className="text-sm text-gray-400">
                  Stake your RPS tokens to earn eRPS. Higher stakes and longer durations earn more rewards.
                </p>
              </div>

              {/* Step 4: Use eRPS */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="h-32 w-full relative mb-3">
                  <Image
                    src="/36.png"
                    alt="Use eRPS"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-2">4. Use eRPS</h4>
                <p className="text-sm text-gray-400">
                  Use your eRPS to play games and win more RPS. Battle, compete, and grow your earnings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data */}
      <Card className="bg-gradient-to-br from-slate-900/90 via-blue-900/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Market Data</span>
            <a 
              href="https://www.coinbase.com/en-es/price/rps-league"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Data from Coinbase
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Original Market Data Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div>
              <Label>RPS Price</Label>
              <div className="text-2xl font-bold text-green-400">€0.000219</div>
              <div className="text-sm text-green-500">+5.2%</div>
            </div>
            <div>
              <Label>24h Volume</Label>
              <div className="text-xl font-bold">Coming Soon</div>
              <div className="text-xs text-gray-400 mt-1">
                Listing on 3 exchanges (1st Feb 2025)
                <br />
                Uniswap/PancakeSwap (25th Jan)
              </div>
            </div>
            <div>
              <Label>Initial Market Cap</Label>
              <div className="text-xl font-bold">$3,032,030</div>
            </div>
            <div>
              <Label>Total Staked</Label>
              <div className="text-xl font-bold">$5,678,901</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-8">
        {/* RPS Metaverse Box */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-cyan-900/90 to-slate-900/90 backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                <path d="M3 21h18"/>
                <path d="M19 21v-4"/>
                <path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2"/>
                <path d="M5 21v-4"/>
                <path d="M3 7v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/>
                <path d="M8 5v2"/>
                <path d="M16 5v2"/>
                <path d="M12 5v2"/>
                <path d="M4 5h16"/>
              </svg>
              RPS Metaverse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Step into the future of gaming with RPS Metaverse. Experience immersive 3D battles, own virtual land, and participate in metaverse tournaments. Build your own RPS arena, customize your avatar, and connect with players worldwide in our expanding virtual ecosystem.
            </p>
            <Button className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              Available on 2025 Q4
            </Button>
          </CardContent>
        </Card>

        {/* RPS Marketplace Box */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-emerald-900/90 to-slate-900/90 backdrop-blur-sm border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 text-transparent bg-clip-text flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <path d="M4 19V9"/>
                <path d="M20 19V9"/>
                <path d="M4 19h16"/>
                <path d="M4 9h16"/>
                <path d="M12 4v5"/>
                <path d="m8 8 4-4 4 4-4-4-4"/>
                <path d="M8 15h0"/>
                <path d="M16 15h0"/>
                <path d="M12 15h0"/>
              </svg>
              RPS Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Trade exclusive RPS NFTs, rare game items, and limited edition collectibles. Our marketplace features unique skins, special effects, and power-ups. Buy, sell, or auction your items securely with our integrated smart contract system. Earn while you play!
            </p>
            <Button className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              Available on 2025 Q2
            </Button>
          </CardContent>
        </Card>

        {/* Weekly League Box */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-orange-900/90 to-slate-900/90 backdrop-blur-sm border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 text-transparent bg-clip-text flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97.93l-2.9-.37"/>
                <path d="M14 14.66V17c0 .55.47.98.97.93l2.9-.37"/>
                <path d="M12 2v8"/>
                <path d="M12 12a4 4 0 0 0 4-4"/>
                <path d="M12 12a4 4 0 0 1-4-4"/>
              </svg>
              Weekly League
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Compete in our weekly tournaments for massive rewards! Climb the leaderboard, earn special badges, and win exclusive prizes. Each week features different game modes, special rules, and increasing prize pools. Join now to become the ultimate RPS champion!
            </p>
            <Button className="w-full mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
              Available on 2025 Q1
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staking Dialog */}
      {state.stakingDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl border border-purple-500/20 w-[400px] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-purple-400">Stake RPS</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-300"
                onClick={() => setState(prev => ({ ...prev, stakingDialogOpen: false }))}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Amount to Stake</Label>
                <Input
                  type="number"
                  placeholder="Enter RPS amount"
                  className="mt-1 bg-slate-800/50 border-purple-500/20"
                  value={state.stakingAmount}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    stakingAmount: e.target.value 
                  }))}
                />
                <div className="text-xs text-gray-400 mt-1">
                  Available: {state.rpsCoins.toLocaleString()} RPS
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Staking Period</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { days: 7, apr: 35, penalty: 10 },
                    { days: 30, apr: 55, penalty: 15 },
                    { days: 60, apr: 105, penalty: 20 },
                    { days: 180, apr: 135, penalty: 30 },
                  ].map((pkg) => (
                    <div
                      key={pkg.days}
                      className={`p-3 bg-slate-800/50 rounded-lg border cursor-pointer hover:bg-slate-800/70 transition-all ${
                        state.selectedStakingPackage?.days === pkg.days 
                          ? 'border-purple-500' 
                          : 'border-purple-500/20'
                      }`}
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          selectedStakingPackage: pkg
                        }))
                      }}
                    >
                      <div className="text-purple-400 font-bold">{pkg.days} Days</div>
                      <div className="text-sm text-gray-400">APR: {pkg.apr}%</div>
                      <div className="text-xs text-red-400">
                        Early unstake penalty: {pkg.penalty}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={!state.selectedStakingPackage || !state.stakingAmount || Number(state.stakingAmount) <= 0}
                onClick={() => {
                  const amount = Number(state.stakingAmount);
                  
                  if (amount <= 0 || amount > state.rpsCoins) {
                    toast({
                      title: "Invalid Amount",
                      description: "Please enter a valid amount within your balance.",
                      variant: "destructive"
                    });
                    return;
                  }

                  setState(prev => ({
                    ...prev,
                    rpsCoins: prev.rpsCoins - amount,
                    stakingRPS: prev.stakingRPS + amount,
                    stakedAmounts: [
                      ...prev.stakedAmounts,
                      {
                        amount,
                        startDate: new Date().toISOString(),
                        duration: prev.selectedStakingPackage!.days,
                        apr: prev.selectedStakingPackage!.apr,
                        penalty: prev.selectedStakingPackage!.penalty
                      }
                    ],
                    stakingDialogOpen: false,
                    selectedStakingPackage: null,
                    stakingAmount: ''
                  }));

                  toast({
                    title: "Staking Successful",
                    description: `${amount.toLocaleString()} RPS has been staked for ${state.selectedStakingPackage!.days} days at ${state.selectedStakingPackage!.apr}% APR`,
                  });
                }}
              >
                Confirm Stake
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unstake Confirmation Dialog */}
      {state.unstakeDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl border border-red-500/20 w-[400px] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-red-400">Confirm Unstake</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-300"
                onClick={() => setState(prev => ({ ...prev, unstakeDialogOpen: false }))}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-gray-400">
                <p className="mb-4">You have the following staked amounts:</p>
                {state.stakedAmounts.map((stake, index) => {
                  const stakeDuration = Math.floor((new Date().getTime() - new Date(stake.startDate).getTime()) / (1000 * 60 * 60 * 24));
                  const isEarlyUnstake = stakeDuration < stake.duration;
                  const penaltyAmount = isEarlyUnstake ? stake.amount * (stake.penalty / 100) : 0;
                  
                  return (
                    <div key={index} className="mb-2 p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between">
                        <span>{stake.amount.toLocaleString()} RPS</span>
                        <span>{stake.duration} days package</span>
                      </div>
                      <div className="text-sm mt-1">
                        <div>Staked: {stakeDuration} days ago</div>
                        {isEarlyUnstake && (
                          <div className="text-red-400">
                            Early unstake penalty: {stake.penalty}% ({penaltyAmount.toLocaleString()} RPS)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="text-lg font-bold text-gray-300">
                  Total Return: {calculateUnstakeReturn().toLocaleString()} RPS
                </div>
                <div className="text-sm text-red-400">
                  Total Penalty: {calculateTotalPenalty().toLocaleString()} RPS
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    const returnAmount = calculateUnstakeReturn();

                    setState(prev => ({
                      ...prev,
                      rpsCoins: prev.rpsCoins + returnAmount,
                      stakingRPS: 0,
                      stakedAmounts: [],
                      unstakeDialogOpen: false
                    }));

                    toast({
                      title: "Unstake Successful",
                      description: `${returnAmount.toLocaleString()} RPS has been returned to your balance (after penalties).`,
                    });
                  }}
                >
                  Confirm Unstake
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setState(prev => ({ ...prev, unstakeDialogOpen: false }))}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 pt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <Image 
              src="/rpslogo.png" 
              alt="RPS League" 
              width={80}
              height={80}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
              RPS League Team
            </h2>
            <p className="text-gray-400 text-center max-w-2xl">
              Our dedicated team of experts working to revolutionize the gaming industry through blockchain technology and innovative gameplay mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="relative w-24 h-24 mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover border-2 border-purple-500/20"
                  />
                </div>
                <h3 className="text-lg font-semibold text-purple-300">{member.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{member.role}</p>
                {member.social && (
                  <a 
                    href={member.social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    Connect
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 py-8 text-center text-sm text-gray-400">
            <p>© 2024 RPS League. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="#" className="hover:text-purple-400">Terms of Service</a>
              <a href="#" className="hover:text-purple-400">Privacy Policy</a>
              <a href="#" className="hover:text-purple-400">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 