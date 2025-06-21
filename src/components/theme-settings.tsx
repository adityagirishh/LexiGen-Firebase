"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ThemeSettings() {
  const { setTheme, theme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'secondary' : 'ghost'}
                onClick={() => setTheme("light")}
                className="justify-start"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'secondary' : 'ghost'}
                onClick={() => setTheme("dark")}
                className="justify-start"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </Button>
              <Button
                 variant={theme === 'system' ? 'secondary' : 'ghost'}
                onClick={() => setTheme("system")}
                className="justify-start"
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </Button>
          </div>
      </CardContent>
    </Card>
  )
}
