'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { prisma } from '@/lib/prisma'

interface UserData {
  username: string
  password: string
  rpsCoins: number
  usdtBalance: number
  referralCode: string
  referralBonus: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)

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

      fetchUsers() // Refresh the list
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <th className="p-2 text-left">Referral Code</th>
                      <th className="p-2 text-left">Referral Bonus</th>
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
                              value={user.referralCode}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, referralCode: e.target.value }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                            />
                          ) : user.referralCode}
                        </td>
                        <td className="p-2">
                          {editingUser === user.username ? (
                            <Input 
                              type="number"
                              value={user.referralBonus}
                              onChange={(e) => {
                                const updatedUsers = users.map(u => 
                                  u.username === user.username 
                                    ? { ...u, referralBonus: Number(e.target.value) }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }}
                            />
                          ) : user.referralBonus.toLocaleString()}
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