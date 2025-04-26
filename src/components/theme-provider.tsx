"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove both theme classes first
    root.classList.remove("light", "dark")

    // Determine which theme to apply
    let themeToApply = theme

    if (theme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    // Apply the theme class
    root.classList.add(themeToApply)

    // Also set a data-theme attribute for components that might use it
    root.setAttribute("data-theme", themeToApply)

    // Log for debugging
    console.log("Theme applied:", themeToApply)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
      console.log("Theme set to:", theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
