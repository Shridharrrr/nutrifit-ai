export interface foodItem {
    id: number
    title: string
    image: string
    summary: string
    readyInMinutes: number
    servings: number
    healthScore: number
    period: string
    nutrients: {
      name: string
      amount: number
      unit: string
      percentOfDailyNeeds?: number
    }[]
    sourceUrl: string
    instructions?: string
    ingredients?: {
      id: number
      name: string
      amount: number
      unit: string
      original: string
    }[]
    diets?: string[]
    dishTypes?: string[]
  }
  