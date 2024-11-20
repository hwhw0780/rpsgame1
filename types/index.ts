export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  balancePoints: number
  playablePoints: number
  withdrawablePoints: number
  createdAt: Date
  lastLogin: Date
}

export interface LoginForm {
  username: string
  password: string
} 