'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function Login() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid username or password"
        })
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`
      })

      router.push(data.user.role === 'admin' ? '/admin' : '/')
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

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          referralCode: formData.referralCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to register"
        })
        return
      }

      toast({
        title: "Registration Successful",
        description: "Please login with your new account"
      })

      setIsRegistering(false)
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        referralCode: ''
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
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="referralCode" className="text-gray-200">Referral Code</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      referralCode: e.target.value
                    }))}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </>
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
                  confirmPassword: '',
                  referralCode: ''
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