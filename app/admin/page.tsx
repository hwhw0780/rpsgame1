'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UserData {
  username: string
  password?: string
  rpsCoins: number
  usdtBalance: number
  eRPS: number
  stakingRPS: number
  withdrawableERPS: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    rpsCoins: 0,
    usdtBalance: 0,
    eRPS: 0,
    stakingRPS: 0,
    withdrawableERPS: 0
  })
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUsername(userData.username)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (username: string, updatedData: Partial<UserData>) => {
    try {
      const { password, ...updateFields } = updatedData

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ...updateFields
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      fetchUsers()
      setEditingUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive"
      })
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })

      setNewUser({
        username: '',
        password: '',
        rpsCoins: 0,
        usdtBalance: 0,
        eRPS: 0,
        stakingRPS: 0,
        withdrawableERPS: 0
      })
      setShowCreateForm(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (username: string) => {
    try {
      const response = await fetch(`/api/admin/users/${username}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
            {username && (
              <p className="text-gray-400 mt-1">
                Welcome back, <span className="text-purple-400 font-semibold">{username}</span>
              </p>
            )}
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create New User
          </Button>
        </div>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Create New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Username</Label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label className="text-white">Password</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label className="text-white">RPS Balance</Label>
                  <Input
                    type="number"
                    value={newUser.rpsCoins}
                    onChange={(e) => setNewUser(prev => ({ ...prev, rpsCoins: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-white">USDT Balance</Label>
                  <Input
                    type="number"
                    value={newUser.usdtBalance}
                    onChange={(e) => setNewUser(prev => ({ ...prev, usdtBalance: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-white">eRPS Balance</Label>
                  <Input
                    type="number"
                    value={newUser.eRPS}
                    onChange={(e) => setNewUser(prev => ({ ...prev, eRPS: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-white">Staking RPS</Label>
                  <Input
                    type="number"
                    value={newUser.stakingRPS}
                    onChange={(e) => setNewUser(prev => ({ ...prev, stakingRPS: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-white">Withdrawable eRPS</Label>
                  <Input
                    type="number"
                    value={newUser.withdrawableERPS}
                    onChange={(e) => setNewUser(prev => ({ ...prev, withdrawableERPS: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newUser.username || !newUser.password}
                >
                  Create User
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div>Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-2 text-left">Username</th>
                      <th className="p-2 text-left">Password</th>
                      <th className="p-2 text-left">RPS Balance</th>
                      <th className="p-2 text-left">USDT Balance</th>
                      <th className="p-2 text-left">eRPS Balance</th>
                      <th className="p-2 text-left">Staking RPS</th>
                      <th className="p-2 text-left">Withdrawable eRPS</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.username} className="border-b border-gray-800">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">********</td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input
                              type="number"
                              value={user.rpsCoins}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, rpsCoins: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                              className="w-32"
                            />
                          ) : (
                            user.rpsCoins.toLocaleString()
                          )}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input
                              type="number"
                              value={user.usdtBalance}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, usdtBalance: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                              className="w-32"
                            />
                          ) : (
                            user.usdtBalance.toLocaleString()
                          )}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input
                              type="number"
                              value={user.eRPS}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, eRPS: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                              className="w-32"
                            />
                          ) : (
                            user.eRPS.toLocaleString()
                          )}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input
                              type="number"
                              value={user.stakingRPS}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, stakingRPS: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                              className="w-32"
                            />
                          ) : (
                            user.stakingRPS.toLocaleString()
                          )}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input
                              type="number"
                              value={user.withdrawableERPS}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, withdrawableERPS: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                              className="w-32"
                            />
                          ) : (
                            user.withdrawableERPS.toLocaleString()
                          )}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdate(user.username, user)}
                                className="bg-green-600/20 hover:bg-green-600/40 text-green-400"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(null)}
                                className="bg-red-600/20 hover:bg-red-600/40 text-red-400"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user.username)}
                                className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (user.username === 'admin') {
                                    toast({
                                      title: "Error",
                                      description: "Cannot delete admin user",
                                      variant: "destructive"
                                    })
                                    return
                                  }
                                  if (window.confirm('Are you sure you want to delete this user?')) {
                                    try {
                                      const response = await fetch('/api/admin/users', {
                                        method: 'DELETE',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ username: user.username })
                                      })

                                      if (!response.ok) {
                                        const error = await response.json()
                                        throw new Error(error.error || 'Failed to delete user')
                                      }

                                      toast({
                                        title: "Success",
                                        description: "User deleted successfully"
                                      })

                                      // Refresh the users list
                                      fetchUsers()
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: error instanceof Error ? error.message : "Failed to delete user",
                                        variant: "destructive"
                                      })
                                    }
                                  }
                                }}
                                className="bg-red-600/20 hover:bg-red-600/40 text-red-400"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}