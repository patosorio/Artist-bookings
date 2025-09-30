import { useState } from "react"
import { agencyApi } from "@/lib/api/agency-api"

interface InviteData {
  email: string
  role: "agency_agent" | "agency_manager" | "agency_viewer"
}

interface InviteSuccess {
  show: boolean
  url?: string
}

interface UseUserInvitationsReturn {
  // Dialog state
  isInviteDialogOpen: boolean
  setIsInviteDialogOpen: (open: boolean) => void
  
  // Form state
  inviteData: InviteData
  setInviteData: (data: InviteData) => void
  
  // Success state
  inviteSuccess: InviteSuccess
  setInviteSuccess: (success: InviteSuccess) => void
  
  // Actions
  handleInviteUser: (e: React.FormEvent, onSuccess?: () => Promise<void>) => Promise<void>
}

export function useUserInvitations(): UseUserInvitationsReturn {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData>({
    email: "",
    role: "agency_agent" as const,
  })
  const [inviteSuccess, setInviteSuccess] = useState<InviteSuccess>({ show: false })

  const handleInviteUser = async (e: React.FormEvent, onSuccess?: () => Promise<void>) => {
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
      
      // Call success callback if provided (e.g., refresh users list)
      if (onSuccess) {
        await onSuccess()
      }
      
      console.log("User invited successfully")
    } catch (error: any) {
      console.error("Failed to send invite:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to send invite"
      alert(errorMessage)
    }
  }

  return {
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    inviteData,
    setInviteData,
    inviteSuccess,
    setInviteSuccess,
    handleInviteUser
  }
}
