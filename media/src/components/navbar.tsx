"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, LaptopIcon, MenuIcon } from "lucide-react";
import { SearchDropdown } from "./search-dropdown";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleNavigation = () => {
    setIsOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link
        href="/"
        onClick={handleNavigation}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive("/")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        Home
      </Link>
      <Link
        href="/files"
        onClick={handleNavigation}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive("/files")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        Files
      </Link>
      <Link
        href="/upload"
        onClick={handleNavigation}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive("/upload")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        Upload
      </Link>
      <Link
        href="/analytics"
        onClick={handleNavigation}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive("/analytics")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        Analytics
      </Link>
    </>
  );

  const ThemeSelector = () => (
    <Select
      value={theme || "system"}
      onValueChange={(value) => {
        setTheme(value as "light" | "dark" | "system");
      }}
    >
      <SelectTrigger className="w-9 h-9 p-0">
        <SelectValue>
          {theme === "light" ? (
            <SunIcon className="h-4 w-4" />
          ) : theme === "dark" ? (
            <MoonIcon className="h-4 w-4" />
          ) : (
            <LaptopIcon className="h-4 w-4" />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <SunIcon className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <MoonIcon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <LaptopIcon className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] flex flex-col">
              <nav className="flex flex-col space-y-1 mt-4">
                <NavLinks />
              </nav>
              <div className="mt-auto border-t pt-4">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Theme</div>
                <Select
                  value={theme || "system"}
                  onValueChange={(value) => {
                    setTheme(value as "light" | "dark" | "system");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {theme === "light" ? (
                          <SunIcon className="h-4 w-4" />
                        ) : theme === "dark" ? (
                          <MoonIcon className="h-4 w-4" />
                        ) : (
                          <LaptopIcon className="h-4 w-4" />
                        )}
                        <span>{(theme || "system").charAt(0).toUpperCase() + (theme || "system").slice(1)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <SunIcon className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <MoonIcon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <LaptopIcon className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLinks />
        </nav>
        <div className="flex items-center space-x-4 ml-auto">
          <SearchDropdown />
          <div className="hidden lg:block">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </header>
  );
} 