'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UserData {
  username: string
  password: string
  rpsCoins: number
  usdtBalance: number
  eRPS: number
  withdrawableERPS: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    rpsCoins: 0,
    usdtBalance: 0,
    eRPS: 0,
    withdrawableERPS: 0
  })
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
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
        description: "User created successfully. They can now login.",
      })

      // Reset form and refresh user list
      setNewUser({
        username: '',
        password: '',
        rpsCoins: 0,
        usdtBalance: 0,
        eRPS: 0,
        withdrawableERPS: 0
      })
      setShowCreateForm(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (username: string, updatedData: Partial<UserData>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ...updatedData
        })
      })

      if (!response.ok) throw new Error('Update failed')

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      fetchUsers()
      setEditingUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Create New User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Create User Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label>RPS Balance</Label>
                  <Input
                    type="number"
                    value={newUser.rpsCoins}
                    onChange={(e) => setNewUser(prev => ({ ...prev, rpsCoins: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>USDT Balance</Label>
                  <Input
                    type="number"
                    value={newUser.usdtBalance}
                    onChange={(e) => setNewUser(prev => ({ ...prev, usdtBalance: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>eRPS Balance</Label>
                  <Input
                    type="number"
                    value={newUser.eRPS}
                    onChange={(e) => setNewUser(prev => ({ ...prev, eRPS: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Withdrawable eRPS</Label>
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!newUser.username || !newUser.password}
                >
                  Create User
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
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
                      <th className="p-2 text-left">Withdrawable eRPS</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.username} className="border-b border-gray-800">
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input 
                              value={user.username}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, username: e.target.value }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                            />
                          ) : user.username}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input 
                              type="password"
                              placeholder="New password"
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, password: e.target.value }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                            />
                          ) : "********"}
                        </td>
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
                            />
                          ) : user.rpsCoins.toLocaleString()}
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
                            />
                          ) : user.usdtBalance.toLocaleString()}
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
                            />
                          ) : user.eRPS.toLocaleString()}
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
                            />
                          ) : user.withdrawableERPS.toLocaleString()}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdate(user.username, user)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user.username)}
                            >
                              Edit
                            </Button>
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