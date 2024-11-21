export const usernames = [
  "aaliyah",
  "aaren",
  "aarika",
  "aaron",
  "aartjan",
  "aarushi",
  "abagael",
  "abagail",
  "abahri",
  "abbas",
  "abbe",
  "abbey",
  "abbi",
  "abbie",
  "abby",
  "abbye",
  "abdalla",
  "abdallah",
  "abdul",
  "abdullah",
  "abe",
  "abel",
  "abi",
  "abia",
  "abigael",
  "abigail"
  // ... add all other names from your names.txt file
]

// Helper functions for getting random usernames
export const getRandomUsername = () => {
  return usernames[Math.floor(Math.random() * usernames.length)]
}

export const getUniqueRandomUsernames = (count: number) => {
  const shuffled = [...usernames].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
} 