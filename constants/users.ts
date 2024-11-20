export const MOCK_USERS = [
  {
    id: '1',
    username: 'user1',
    password: 'password123',
    role: 'user' as const,
    balancePoints: 40000,
    playablePoints: 10000,
    withdrawablePoints: 0,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    balancePoints: 0,
    playablePoints: 0,
    withdrawablePoints: 0,
    createdAt: new Date(),
    lastLogin: new Date()
  }
] 