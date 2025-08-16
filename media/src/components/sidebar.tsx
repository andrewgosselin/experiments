"use client";

import { Button } from "@/components/ui/button";
import { HomeIcon, SettingsIcon, SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function Sidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col h-full">
      <div className="flex-1">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <SunIcon className="mr-2 h-4 w-4" />
          ) : (
            <MoonIcon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </div>
  );
} 