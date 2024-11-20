'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { User } from "@/types"
import { MOCK_USERS } from '@/constants/users'

// Add new interface for user creation
interface CreateUserForm {
  username: string
  password: string
  referralCode: string
}

// Add this function at the top level
const getStoredUsers = () => {
  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('users')
    return storedUsers ? JSON.parse(storedUsers) : MOCK_USERS
  }
  return MOCK_USERS
}

export default function AdminDashboard() {
  // Update initial users state to get from localStorage
  const [users, setUsers] = useState<User[]>(getStoredUsers())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [topupAmount, setTopupAmount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    username: '',
    password: '',
    referralCode: ''
  })

  useEffect(() => {
    // Check if admin is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'admin') {
        // Redirect to login page with admin tab selected
        window.location.href = '/login?type=admin'
        return
      }

      // Initialize users state with stored users
      const storedUsers = localStorage.getItem('users')
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      } else {
        // If no stored users, initialize with MOCK_USERS and store them
        localStorage.setItem('users', JSON.stringify(MOCK_USERS))
        setUsers(MOCK_USERS)
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      window.location.href = '/login'
    }
  }, []) // Empty dependency array means this runs once on mount

  // Add useEffect to save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  const handleTopup = () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      })
      return
    }

    if (topupAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      })
      return
    }

    // Update user's balance
    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            balancePoints: user.balancePoints + topupAmount
          }
        : user
    ))

    toast({
      title: "Success",
      description: `Topped up ${topupAmount} points for ${selectedUser.username}`
    })

    // Reset form
    setTopupAmount(0)
    setSelectedUser(null)
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add create user function
  const handleCreateUser = () => {
    // Validate form
    if (!createUserForm.username || !createUserForm.password || !createUserForm.referralCode) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      })
      return
    }

    // Check if username already exists
    if (users.some(user => user.username === createUserForm.username)) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive"
      })
      return
    }

    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      username: createUserForm.username,
      password: createUserForm.password,
      role: 'user',
      balancePoints: 0,
      playablePoints: 0,
      withdrawablePoints: 0,
      createdAt: new Date(),
      lastLogin: new Date()
    }

    setUsers(prev => [...prev, newUser])
    
    toast({
      title: "Success",
      description: `User ${createUserForm.username} created successfully`
    })

    // Reset form and close modal
    setCreateUserForm({
      username: '',
      password: '',
      referralCode: ''
    })
    setShowCreateUser(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Create User Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Create New User
            </Button>
          </div>

          {/* Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-200">Search Users</Label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Users List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-200">Users</h2>
            <div className="grid gap-4">
              {filteredUsers.map(user => (
                <div 
                  key={user.id}
                  className={`p-4 rounded-lg ${
                    selectedUser?.id === user.id 
                      ? 'bg-white/20' 
                      : 'bg-white/10'
                  } cursor-pointer hover:bg-white/15 transition-colors`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{user.username}</p>
                      <p className="text-sm text-gray-300">
                        Balance: {user.balancePoints} points
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        Playable: {user.playablePoints}
                      </p>
                      <p className="text-sm text-gray-300">
                        Withdrawable: {user.withdrawablePoints}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topup Form */}
          {selectedUser && (
            <div className="space-y-4 bg-black/20 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-white">
                Top up for {selectedUser.username}
              </h3>
              <div className="space-y-2">
                <Label htmlFor="topup-amount" className="text-gray-200">
                  Amount
                </Label>
                <Input
                  id="topup-amount"
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={1}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleTopup}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Confirm Topup
                </Button>
                <Button 
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl border border-white/20 shadow-xl max-w-md w-full mx-4">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold text-white">Create New User</h2>
                  
                  <div className="space-y-4">
                    {/* Username Input */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-200">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={createUserForm.username}
                        onChange={(e) => setCreateUserForm(prev => ({
                          ...prev,
                          username: e.target.value
                        }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter username"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-200">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={createUserForm.password}
                        onChange={(e) => setCreateUserForm(prev => ({
                          ...prev,
                          password: e.target.value
                        }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter password"
                      />
                    </div>

                    {/* Referral Code Input */}
                    <div className="space-y-2">
                      <Label htmlFor="referral-code" className="text-gray-200">
                        Referral Code
                      </Label>
                      <Input
                        id="referral-code"
                        value={createUserForm.referralCode}
                        onChange={(e) => setCreateUserForm(prev => ({
                          ...prev,
                          referralCode: e.target.value
                        }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter referral code"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleCreateUser}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        Create User
                      </Button>
                      <Button
                        onClick={() => setShowCreateUser(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="bg-blue-500/10 hover:bg-blue-500/20"
            >
              Switch to User
            </Button>
            <Button 
              onClick={() => {
                localStorage.removeItem('user')
                window.location.href = '/login'
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 