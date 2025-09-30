import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { agencyApi } from "@/lib/api/agency-api"
import { AgencyUser } from "@/types/agency"

interface AdminStats {
  title: string
  value: string
  description: string
  icon: any
  color: string
}

interface UseAdminPanelReturn {
  // Data state
  users: AgencyUser[]
  loading: boolean
  
  // Permissions
  hasAccess: boolean
  
  // User management
  handleRoleChange: (userId: string, newRole: string) => Promise<void>
  handleRemoveUser: (userId: string) => Promise<void>
  refreshUsers: () => Promise<void>
  
  // Stats
  stats: AdminStats[]
}

export function useAdminPanel(): UseAdminPanelReturn {
  const { userProfile } = useAuthContext()
  const router = useRouter()
  const [users, setUsers] = useState<AgencyUser[]>([])
  const [loading, setLoading] = useState(true)

  // Check if user has access to admin panel
  const hasAccess = userProfile?.role === "agency_owner" || userProfile?.role === "agency_manager"

  // Redirect if not manager or owner
  useEffect(() => {
    if (!userProfile) {
      // User data is still loading
      return
    }
    
    if (!hasAccess) {
      router.push("/dashboard")
      return
    }
  }, [userProfile, router, hasAccess])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log("Fetching users...");
        const usersData = await agencyApi.fetchAgencyUsers();
        console.log("Users data:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await agencyApi.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)))
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    try {
      await agencyApi.removeUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Failed to remove user:", error)
    }
  }

  const refreshUsers = async () => {
    try {
      const usersData = await agencyApi.fetchAgencyUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Failed to refresh users:", error)
    }
  }

  // Import icons dynamically to avoid issues
  const { Users, DollarSign, Activity, Settings } = require("lucide-react")

  const stats: AdminStats[] = [
    {
      title: "Total Users",
      value: users.length.toString(),
      description: "Active team members",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Monthly Revenue",
      value: "$125,000",
      description: "+12% from last month",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Bookings",
      value: "23",
      description: "This month",
      icon: Activity,
      color: "text-purple-600",
    },
    {
      title: "System Health",
      value: "99.9%",
      description: "Uptime",
      icon: Settings,
      color: "text-orange-600",
    },
  ]

  return {
    users,
    loading,
    hasAccess,
    handleRoleChange,
    handleRemoveUser,
    refreshUsers,
    stats
  }
}
