declare module 'jstat' {
  export const jStat: {
    chisquare: {
      pdf: (x: number, df: number) => number
      cdf: (x: number, df: number) => number
      inv: (p: number, df: number) => number
    }
    normal: {
      pdf: (x: number, mean: number, std: number) => number
      cdf: (x: number, mean: number, std: number) => number
      inv: (p: number, mean: number, std: number) => number
    }
  }
}
