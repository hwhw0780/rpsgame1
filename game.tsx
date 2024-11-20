'use client'

import React from 'react'
import { useState, useEffect } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

type GameMode = 'idle' | 'pvp' | 'pvb' | 'betting' | 'battling' | 'withdrawing'
type Choice = 'rock' | 'paper' | 'scissors'
type GameResult = 'win' | 'lose' | 'draw' | null

const choiceEmoji: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
}

const choices: Choice[] = ['rock', 'paper', 'scissors']
const maxGamesPerDay = 5

interface GameState {
  balance: number
  gameMode: GameMode
  result: string | null
  playerChoice: Choice | null
  botChoice: Choice | null
  gameResult: GameResult
  betAmount: number
  withdrawAmount: number
  gamesPlayed: number
  lastResetDate: string
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

export default function Component() {
  const initialState: GameState = {
    balance: parseInt(localStorage.getItem('balance') ?? '50000'),
    gameMode: 'idle',
    result: null,
    playerChoice: null,
    botChoice: null,
    gameResult: null,
    betAmount: 100,
    withdrawAmount: 0,
    gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') ?? '0'),
    lastResetDate: localStorage.getItem('lastResetDate') ?? new Date().toDateString()
  }

  const [state, setState] = useState<GameState>(initialState)

  useEffect(() => {
    localStorage.setItem('balance', state.balance.toString())
    localStorage.setItem('gamesPlayed', state.gamesPlayed.toString())
    localStorage.setItem('lastResetDate', state.lastResetDate)
  }, [state.balance, state.gamesPlayed, state.lastResetDate])

  useEffect(() => {
    const today = new Date().toDateString()
    if (today !== state.lastResetDate) {
      setState(prev => ({
        ...prev,
        gamesPlayed: 0,
        lastResetDate: today
      }))
    }
  }, [state.lastResetDate])

  const handlePVB = () => {
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
    if (state.betAmount <= 0 || state.betAmount > state.balance) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount.",
        variant: "destructive"
      })
      return
    }

    setState(prev => ({
      ...prev,
      balance: prev.balance - prev.betAmount,
      gameMode: 'pvb',
      result: "Choose your move!"
    }))
  }

  const playGame = (choice: Choice) => {
    if (state.gamesPlayed >= maxGamesPerDay) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily game limit! Come back tomorrow.",
        variant: "destructive"
      })
      return
    }

    setState(prev => ({
      ...prev,
      playerChoice: choice,
      gameMode: 'battling'
    }))
    
    setTimeout(() => {
      const bot = getRandomChoice()
      const result = determineWinner(choice, bot)
      
      setState(prev => ({
        ...prev,
        botChoice: bot,
        gameResult: result,
        balance: result === 'win' ? prev.balance + prev.betAmount * 2 :
                 result === 'draw' ? prev.balance + prev.betAmount :
                 prev.balance,
        gamesPlayed: prev.gamesPlayed + 1,
        result: `You ${result}!`
      }))

      // Reset game after showing result
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          gameMode: 'idle',
          playerChoice: null,
          botChoice: null,
          gameResult: null,
          result: null
        }))
      }, 3000)
    }, 2000)
  }

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-center">Rock Paper Scissors</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-2 text-xl font-bold">Balance: {state.balance} points</p>
        <div className="mb-4">
          <p className="text-center text-sm text-muted-foreground">
            Games played today: {state.gamesPlayed}/{maxGamesPerDay}
          </p>
          <Progress value={(state.gamesPlayed / maxGamesPerDay) * 100} className="mt-2" />
        </div>

        {state.gameMode === 'idle' && (
          <div className="flex flex-col space-y-2">
            <Button onClick={handlePVB}>Play vs Bot</Button>
          </div>
        )}

        {state.gameMode === 'betting' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bet-amount">Bet Amount</Label>
              <Input
                id="bet-amount"
                type="number"
                value={state.betAmount}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  betAmount: Math.max(0, parseInt(e.target.value) || 0)
                }))}
                min={1}
                max={state.balance}
              />
            </div>
            <Button onClick={handleBet} className="w-full">Place Bet</Button>
          </div>
        )}

        {state.gameMode === 'pvb' && (
          <div className="flex justify-center space-x-2">
            {choices.map(choice => (
              <Button
                key={choice}
                onClick={() => playGame(choice)}
                className="w-24 h-24 text-4xl"
                disabled={!!state.playerChoice}
              >
                {choiceEmoji[choice]}
              </Button>
            ))}
          </div>
        )}

        {(state.gameMode === 'battling' || state.gameMode === 'pvb') && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="text-center">
              <p>You</p>
              <span className={`text-6xl inline-block ${state.gameMode === 'battling' ? 'animate-bounce' : ''}`}>
                {state.playerChoice ? choiceEmoji[state.playerChoice] : '❓'}
              </span>
            </div>
            <div className="text-4xl">VS</div>
            <div className="text-center">
              <p>Bot</p>
              <span className={`text-6xl inline-block ${state.gameMode === 'battling' ? 'animate-bounce' : ''}`}>
                {state.botChoice ? choiceEmoji[state.botChoice] : '❓'}
              </span>
            </div>
          </div>
        )}

        {state.result && (
          <p className={`text-center mt-4 text-2xl font-bold ${
            state.gameResult === 'win' ? 'text-green-500' : 
            state.gameResult === 'lose' ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {state.result}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 