"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building2 } from "lucide-react"
import { usePromotersContext } from "@/components/providers/PromotersProvider"
import { PromotersTable } from "@/components/promoters/promotersTable"
import type { Promoter, CreatePromoterData, UpdatePromoterData } from "@/types/promoters"
import { toast } from "sonner"

const promoterTypes = [
  { value: "festival", label: "Festival" },
  { value: "club", label: "Club" },
  { value: "venue", label: "Venue" },
  { value: "agency", label: "Agency" },
  { value: "private", label: "Private" },
  { value: "corporate", label: "Corporate" }
]

export default function PromotersPage() {
  const { promoters: promotersList, loading, refreshPromoters } = usePromotersContext()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPromoter, setEditingPromoter] = useState<Promoter | null>(null)
  const defaultPromoterData: CreatePromoterData = {
    promoter_name: "",
    promoter_email: "",
    promoter_phone: "",
    company_name: "",
    company_address: "",
    company_city: "",
    company_zipcode: "",
    company_country: "",
    promoter_type: "club",
    tax_id: "",
    website: "",
    notes: "",
    is_active: true
  }
  const [newPromoter, setNewPromoter] = useState<CreatePromoterData>(defaultPromoterData)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  const handleCreatePromoter = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    try {
      const { promoters } = await import("@/lib/api/promoter-api")
      const created = await promoters.create(newPromoter)
      await refreshPromoters()
      setIsCreateDialogOpen(false)
      setNewPromoter(defaultPromoterData)
      toast.success("Promoter created successfully!")
    } catch (error: any) {
      console.error("Failed to create promoter:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to create promoter")
        }
      } else {
        toast.error("Failed to create promoter")
      }
    }
  }

  const handleEditPromoter = (promoter: Promoter) => {
    setEditingPromoter(promoter)
    setIsEditDialogOpen(true)
  }

  const handleUpdatePromoter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPromoter) return

    setFormErrors({})
    try {
      const { promoters } = await import("@/lib/api/promoter-api")
      const updateData: UpdatePromoterData = {
        promoter_name: editingPromoter.promoter_name,
        promoter_email: editingPromoter.promoter_email,
        promoter_phone: editingPromoter.promoter_phone,
        company_name: editingPromoter.company_name,
        company_address: editingPromoter.company_address,
        company_city: editingPromoter.company_city,
        company_zipcode: editingPromoter.company_zipcode,
        company_country: editingPromoter.company_country,
        promoter_type: editingPromoter.promoter_type,
        tax_id: editingPromoter.tax_id,
        website: editingPromoter.website,
        notes: editingPromoter.notes,
        is_active: editingPromoter.is_active
      }
      const updated = await promoters.update(editingPromoter.id, updateData)
      await refreshPromoters()
      setIsEditDialogOpen(false)
      setEditingPromoter(null)
      toast.success("Promoter updated successfully!")
    } catch (error: any) {
      console.error("Failed to update promoter:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to update promoter")
        }
      } else {
        toast.error("Failed to update promoter")
      }
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading promoters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promoters</h1>
          <p className="text-muted-foreground">Manage your network of promoters and event organizers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Promoter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Promoter</DialogTitle>
              <DialogDescription>
                Add a new promoter to your network. Fill in their details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePromoter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoter_name">Promoter Name</Label>
                <Input
                  id="promoter_name"
                  value={newPromoter.promoter_name}
                  onChange={(e) => setNewPromoter({ ...newPromoter, promoter_name: e.target.value })}
                  required
                  className={formErrors.promoter_name ? "border-destructive" : ""}
                />
                {formErrors.promoter_name && (
                  <p className="text-sm text-destructive">{formErrors.promoter_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newPromoter.company_name}
                  onChange={(e) => setNewPromoter({ ...newPromoter, company_name: e.target.value })}
                  required
                  className={formErrors.company_name ? "border-destructive" : ""}
                />
                {formErrors.company_name && (
                  <p className="text-sm text-destructive">{formErrors.company_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoter_type">Type</Label>
                <Select
                  value={newPromoter.promoter_type}
                  onValueChange={(value: Promoter['promoter_type']) =>
                    setNewPromoter({ ...newPromoter, promoter_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoterTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoter_email">Email</Label>
                <Input
                  id="promoter_email"
                  type="email"
                  value={newPromoter.promoter_email}
                  onChange={(e) => setNewPromoter({ ...newPromoter, promoter_email: e.target.value })}
                  className={formErrors.promoter_email ? "border-destructive" : ""}
                />
                {formErrors.promoter_email && (
                  <p className="text-sm text-destructive">{formErrors.promoter_email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoter_phone">Phone</Label>
                <Input
                  id="promoter_phone"
                  type="tel"
                  value={newPromoter.promoter_phone}
                  onChange={(e) => setNewPromoter({ ...newPromoter, promoter_phone: e.target.value })}
                  className={formErrors.promoter_phone ? "border-destructive" : ""}
                />
                {formErrors.promoter_phone && (
                  <p className="text-sm text-destructive">{formErrors.promoter_phone[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_city">City</Label>
                <Input
                  id="company_city"
                  value={newPromoter.company_city}
                  onChange={(e) => setNewPromoter({ ...newPromoter, company_city: e.target.value })}
                  className={formErrors.company_city ? "border-destructive" : ""}
                />
                {formErrors.company_city && (
                  <p className="text-sm text-destructive">{formErrors.company_city[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_country">Country</Label>
                <Input
                  id="company_country"
                  value={newPromoter.company_country}
                  onChange={(e) => setNewPromoter({ ...newPromoter, company_country: e.target.value })}
                  className={formErrors.company_country ? "border-destructive" : ""}
                />
                {formErrors.company_country && (
                  <p className="text-sm text-destructive">{formErrors.company_country[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={newPromoter.website}
                  onChange={(e) => setNewPromoter({ ...newPromoter, website: e.target.value })}
                  className={formErrors.website ? "border-destructive" : ""}
                />
                {formErrors.website && (
                  <p className="text-sm text-destructive">{formErrors.website[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPromoter.notes}
                  onChange={(e) => setNewPromoter({ ...newPromoter, notes: e.target.value })}
                  className={formErrors.notes ? "border-destructive" : ""}
                />
                {formErrors.notes && (
                  <p className="text-sm text-destructive">{formErrors.notes[0]}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Promoter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Promoter Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Promoter</DialogTitle>
              <DialogDescription>
                Update the promoter's information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePromoter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_promoter_name">Promoter Name</Label>
                <Input
                  id="edit_promoter_name"
                  value={editingPromoter?.promoter_name || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, promoter_name: e.target.value} : null)}
                  required
                  className={formErrors.promoter_name ? "border-destructive" : ""}
                />
                {formErrors.promoter_name && (
                  <p className="text-sm text-destructive">{formErrors.promoter_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_company_name">Company Name</Label>
                <Input
                  id="edit_company_name"
                  value={editingPromoter?.company_name || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, company_name: e.target.value} : null)}
                  required
                  className={formErrors.company_name ? "border-destructive" : ""}
                />
                {formErrors.company_name && (
                  <p className="text-sm text-destructive">{formErrors.company_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_promoter_type">Type</Label>
                <Select
                  value={editingPromoter?.promoter_type || "club"}
                  onValueChange={(value: Promoter['promoter_type']) =>
                    setEditingPromoter(prev => prev ? {...prev, promoter_type: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoterTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_promoter_email">Email</Label>
                <Input
                  id="edit_promoter_email"
                  type="email"
                  value={editingPromoter?.promoter_email || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, promoter_email: e.target.value} : null)}
                  className={formErrors.promoter_email ? "border-destructive" : ""}
                />
                {formErrors.promoter_email && (
                  <p className="text-sm text-destructive">{formErrors.promoter_email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_promoter_phone">Phone</Label>
                <Input
                  id="edit_promoter_phone"
                  type="tel"
                  value={editingPromoter?.promoter_phone || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, promoter_phone: e.target.value} : null)}
                  className={formErrors.promoter_phone ? "border-destructive" : ""}
                />
                {formErrors.promoter_phone && (
                  <p className="text-sm text-destructive">{formErrors.promoter_phone[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_company_city">City</Label>
                <Input
                  id="edit_company_city"
                  value={editingPromoter?.company_city || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, company_city: e.target.value} : null)}
                  className={formErrors.company_city ? "border-destructive" : ""}
                />
                {formErrors.company_city && (
                  <p className="text-sm text-destructive">{formErrors.company_city[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_company_country">Country</Label>
                <Input
                  id="edit_company_country"
                  value={editingPromoter?.company_country || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, company_country: e.target.value} : null)}
                  className={formErrors.company_country ? "border-destructive" : ""}
                />
                {formErrors.company_country && (
                  <p className="text-sm text-destructive">{formErrors.company_country[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_website">Website</Label>
                <Input
                  id="edit_website"
                  type="url"
                  value={editingPromoter?.website || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, website: e.target.value} : null)}
                  className={formErrors.website ? "border-destructive" : ""}
                />
                {formErrors.website && (
                  <p className="text-sm text-destructive">{formErrors.website[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editingPromoter?.notes || ""}
                  onChange={(e) => setEditingPromoter(prev => prev ? {...prev, notes: e.target.value} : null)}
                  className={formErrors.notes ? "border-destructive" : ""}
                />
                {formErrors.notes && (
                  <p className="text-sm text-destructive">{formErrors.notes[0]}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingPromoter(null)
                  setFormErrors({})
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Promoter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {promotersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No promoters yet</h2>
              <p className="text-muted-foreground">
                Get started by adding your first promoter to your network. You can manage their information, track events, and more.
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Promoter
            </Button>
          </div>
        </div>
      ) : (
        <PromotersTable 
          promoters={promotersList} 
          onEdit={handleEditPromoter}
          onDelete={async (promoter) => {
            await refreshPromoters()
          }}
        />
      )}
    </div>
  )
}
