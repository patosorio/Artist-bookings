"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/hooks/useAuth"
import {
  Calendar,
  Users,
  MapPin,
  UserCheck,
  ContactIcon as Contacts,
  FileText,
  Truck,
  Route,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Shield,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Artists", href: "/artists", icon: Users },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Venues", href: "/venues", icon: MapPin },
  { name: "Promoters", href: "/promoters", icon: UserCheck },
  { name: "Contacts", href: "/contacts", icon: Contacts },
  { name: "Contracts & Files", href: "/contracts", icon: FileText },
  { name: "Logistics", href: "/logistics", icon: Truck },
  { name: "Itineraries", href: "/itineraries", icon: Route },
]

const managerNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { userProfile, agency } = useAuth()

  const isManager = userProfile?.role === "agency_manager" || userProfile?.role === "agency_owner"

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BA</span>
            </div>
            <span className="font-semibold text-sm">{agency?.name}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            )
          })}

          {isManager && (
            <>
              <div className="pt-4">
                {!collapsed && (
                  <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Management
                  </p>
                )}
              </div>
              {managerNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "px-2")}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.name}</span>}
                    </Button>
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  )
}
