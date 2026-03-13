import { useState } from "react"
import type { FontSetting } from "../types"

export function useFontSetting() {
  const [setting, setSetting] = useState<FontSetting>({
    fontFamily: "Times New Roman, serif",
    fontSize: 14,
  })

  return { setting, setSetting }
}