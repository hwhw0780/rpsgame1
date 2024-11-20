'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { MOCK_USERS } from '@/constants/users'
import { User } from '@/types'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Login attempt:', formData) // Debug log
    
    // First, check for admin credentials
    if (formData.username === 'admin' && formData.password === 'admin123') {
      const adminUser = {
        id: '2',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        balancePoints: 0,
        playablePoints: 0,
        withdrawablePoints: 0,
        createdAt: new Date(),
        lastLogin: new Date()
      }
      
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('users', JSON.stringify(MOCK_USERS)) // Initialize users list
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!"
      })

      router.push('/admin')
      return
    }

    // Get users from localStorage or use MOCK_USERS
    const storedUsers = localStorage.getItem('users')
    const users = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS
    
    console.log('Available users:', users) // Debug log

    // Find user with matching credentials
    const user = users.find((u: User) => 
      u.username === formData.username && 
      u.password === formData.password
    )

    console.log('Found user:', user) // Debug log

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`
      })

      router.push('/')
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-[400px] bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 