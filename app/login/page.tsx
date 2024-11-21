'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default function Login() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        const adminUser = {
          id: 'admin',
          username: 'admin',
          role: 'admin',
          balancePoints: 0,
          playablePoints: 0,
          withdrawablePoints: 0,
          createdAt: new Date(),
          lastLogin: new Date()
        }
        
        localStorage.setItem('user', JSON.stringify(adminUser))
        
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!"
        })

        router.push('/admin')
        return
      }

      const user = await prisma.user.findUnique({
        where: { username: formData.username }
      })

      if (!user || !await bcrypt.compare(formData.password, user.password)) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password"
        })
        return
      }

      const { password, ...userData } = user
      localStorage.setItem('user', JSON.stringify(userData))
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`
      })

      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "An error occurred during login"
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        })
        return
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: formData.username }
      })

      if (existingUser) {
        toast({
          title: "Error",
          description: "Username already exists",
          variant: "destructive"
        })
        return
      }

      const hashedPassword = await bcrypt.hash(formData.password, 10)
      const newUser = await prisma.user.create({
        data: {
          username: formData.username,
          password: hashedPassword,
          role: 'user',
          balancePoints: 40000,
          playablePoints: 10000,
          withdrawablePoints: 0
        }
      })

      toast({
        title: "Registration Successful",
        description: "Please login with your new account"
      })

      setIsRegistering(false)
      setFormData({
        username: '',
        password: '',
        confirmPassword: ''
      })

    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: "Failed to register. Please try again."
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-[400px] bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
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

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            )}

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isRegistering ? 'Register' : 'Login'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setFormData({
                  username: '',
                  password: '',
                  confirmPassword: ''
                })
              }}
              className="w-full text-gray-300 hover:text-white"
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 