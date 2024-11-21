import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    
    return NextResponse.json({
      CNY: data.rates.CNY,
      CAD: data.rates.CAD,
      AUD: data.rates.AUD,
      MYR: data.rates.MYR
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
} 