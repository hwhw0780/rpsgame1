// Chinese-style syllables
const pinyinSyllables = [
  "xin", "yun", "yuan", "yin", "wang", "zong", "mei", "ling", "hao", "jie",
  "li", "fang", "cheng", "ming", "hong", "yong", "qiang", "wei", "hua",
  "yu", "fei", "ping", "xia", "feng", "jun", "xi", "bo", "lei", "hui",
  "jia", "zhen", "dan", "song", "ting", "zhang", "xiao", "long", "jing", "shan"
]

// English words/objects/phrases
const englishWords = [
  "king", "queen", "rock", "tree", "fire", "water", "dragon", "star", "shadow",
  "sun", "moon", "crypto", "magic", "yourmama", "legend", "gamer", "dream",
  "code", "speed", "boss", "cool", "hot", "happy", "super", "crazy", "storm",
  "light", "dark", "frost", "ghost", "chaos", "hero", "monster"
]

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper function to get random number
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate a single random username
export const generateRandomUsername = (): string => {
  const structures = [
    "pinyin+pinyin",
    "english+number",
    "pinyin+english",
    "english+pinyin+number"
  ]

  const structure = getRandomItem(structures)

  switch (structure) {
    case "pinyin+pinyin":
      return getRandomItem(pinyinSyllables) + getRandomItem(pinyinSyllables)
    case "english+number":
      return getRandomItem(englishWords) + getRandomNumber(1, 9999)
    case "pinyin+english":
      return getRandomItem(pinyinSyllables) + getRandomItem(englishWords)
    case "english+pinyin+number":
      return getRandomItem(englishWords) + getRandomItem(pinyinSyllables) + getRandomNumber(1, 9999)
    default:
      return getRandomItem(englishWords) + getRandomNumber(1, 9999)
  }
} 