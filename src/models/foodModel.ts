export interface foodItem {
    id: number
    title: string
    image: string
    summary: string
    readyInMinutes: number
    servings: number
    healthScore: number
    period : string
      nutrients: {
        name: string
        amount: number
        unit: string
      }[]
    sourceUrl: string
  }
  