"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/hooks/useAuth"
import { Shield, Users, Settings, Activity, DollarSign, UserPlus, Trash2 } from "lucide-react"
import { agencyApi } from "@/lib/api/agency-api"
import { useRouter } from "next/navigation"
import { AgencyUser } from "@/types/agency"

export default function AdminPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AgencyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "agency_agent" as const,
  })
  const [inviteSuccess, setInviteSuccess] = useState<{
    show: boolean;
    url?: string;
  }>({ show: false })

  // Redirect if not manager or owner
  useEffect(() => {
    if (!userProfile) {
      // User data is still loading
      return
    }
    
    if (userProfile.role !== "agency_owner" && userProfile.role !== "agency_manager") {
      router.push("/dashboard")
      return
    }
  }, [userProfile, router])

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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Sending invite:", inviteData);
      const response = await agencyApi.sendInvite(inviteData.email, inviteData.role)
      console.log("Invite response:", response);
      
      setIsInviteDialogOpen(false)
      setInviteData({ email: "", role: "agency_agent" })
      
      // Show success dialog with invitation URL
      setInviteSuccess({
        show: true,
        url: response.invitation_url
      })
      
      // Refresh users list
      const usersData = await agencyApi.fetchAgencyUsers()
      setUsers(usersData)
      
      console.log("User invited successfully")
    } catch (error: any) {
      console.error("Failed to send invite:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to send invite"
      alert(errorMessage)
    }
  }

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

  if (userProfile?.role !== "agency_owner" && userProfile?.role !== "agency_manager") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need manager or owner permissions to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Loading admin panel...</div>
  }

  const stats = [
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage your agency settings and team members</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Manage your agency team members and their roles</CardDescription>
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a new team member to join your agency.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={inviteData.role}
                        onValueChange={(value: any) => setInviteData({ ...inviteData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agency_agent">Agent</SelectItem>
                          <SelectItem value="agency_manager">Manager</SelectItem>
                          <SelectItem value="agency_viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Send Invitation</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.status === 'pending' ? (
                        <div className="text-sm text-muted-foreground">{user.role} (pending)</div>
                      ) : user.role === 'agency_owner' ? (
                        <div className="text-sm font-medium">Owner</div>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={!user.is_active}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agency_manager">Manager</SelectItem>
                            <SelectItem value="agency_agent">Agent</SelectItem>
                            <SelectItem value="agency_assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === 'pending' ? (
                        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          Pending
                        </span>
                      ) : user.is_active ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === 'pending' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          Cancel Invitation
                        </Button>
                      ) : user.role !== 'agency_owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New user invited</p>
                  <p className="text-xs text-muted-foreground">agent@newagency.com</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Booking created</p>
                  <p className="text-xs text-muted-foreground">DJ Stellar - Madison Square Garden</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Settings updated</p>
                  <p className="text-xs text-muted-foreground">Agency timezone changed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Contract uploaded</p>
                  <p className="text-xs text-muted-foreground">Spring Festival 2024</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <CardDescription>Revenue tracking and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</p>
              <p className="text-2xl font-bold">$1,250,000</p>
              <p className="text-xs text-green-600">+15% from last year</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
              <p className="text-2xl font-bold">$85,000</p>
              <p className="text-xs text-yellow-600">5 invoices outstanding</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">$125,000</p>
              <p className="text-xs text-blue-600">12 completed bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={inviteSuccess.show} onOpenChange={(open) => setInviteSuccess({ show: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Sent Successfully</DialogTitle>
            <DialogDescription>
              Share this invitation link with the user:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={inviteSuccess.url}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(inviteSuccess.url || "");
                  alert("Copied to clipboard!");
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
