"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users } from "lucide-react"
import { artists } from "@/lib/api/artist-api"
import type { Artist, CreateArtistData, UpdateArtistData } from "@/types/artists"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { ArtistGrid } from "@/components/artists/artistCards"
import { toast } from "sonner"

export default function ArtistsPage() {
  const { firebaseUser: user } = useAuth()
  const router = useRouter()
  const [artistsList, setArtistsList] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const defaultArtistData: CreateArtistData = {
    artist_name: "",
    artist_type: "OTHER",
    country: "",
    number_of_members: 1,
    email: "",
    phone: "",
    bio: "",
    status: "active",
    is_active: true
  }
  const [newArtist, setNewArtist] = useState<CreateArtistData>(defaultArtistData)

  useEffect(() => {
      loadArtists()
  }, [])

  const loadArtists = async () => {
    try {
      setLoading(true)
      const data = await artists.fetchArtists()
      setArtistsList(data)
    } catch (error: any) {
      console.error("Failed to load artists:", error)
      toast.error("Failed to load artists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    try {
      const created = await artists.create(newArtist)
      setArtistsList((prev) => [...prev, created])
      setIsCreateDialogOpen(false)
      setNewArtist({
        artist_name: "",
        artist_type: "OTHER",
        country: "",
        number_of_members: 1,
        email: "",
        phone: "",
        bio: "",
        status: "active",
        is_active: true
      })
      toast.success("Artist created successfully!")
    } catch (error: any) {
      console.error("Failed to create artist:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        // Show the first error in the toast
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to create artist")
        }
      } else {
        toast.error("Failed to create artist")
      }
    }
  }

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist)
    setIsEditDialogOpen(true)
  }

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArtist) return

    setFormErrors({})
    try {
      const updateData: UpdateArtistData = {
        artist_name: editingArtist.artist_name,
        artist_type: editingArtist.artist_type,
        country: editingArtist.country || undefined,
        number_of_members: editingArtist.number_of_members,
        email: editingArtist.email,
        phone: editingArtist.phone,
        bio: editingArtist.bio,
        status: editingArtist.status,
        is_active: editingArtist.is_active
      }
      const updated = await artists.update(editingArtist.id, updateData)
      setArtistsList((prev) => prev.map((a) => a.id === updated.id ? updated : a))
      setIsEditDialogOpen(false)
      setEditingArtist(null)
      toast.success("Artist updated successfully!")
    } catch (error: any) {
      console.error("Failed to update artist:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to update artist")
        }
      } else {
        toast.error("Failed to update artist")
      }
    }
  }

  const filteredArtists = artistsList.filter(
    (artist) =>
      artist.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.artist_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading artists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
          <p className="text-muted-foreground">Manage your roster of artists and performers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
              <DialogDescription>
                Add a new artist to your roster. Fill in their details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artist_name">Name</Label>
                <Input
                  id="artist_name"
                  value={newArtist.artist_name}
                  onChange={(e) => setNewArtist({ ...newArtist, artist_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist_type">Type</Label>
                <Select
                  value={newArtist.artist_type}
                  onValueChange={(value: Artist['artist_type']) =>
                    setNewArtist({ ...newArtist, artist_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DJ">DJ</SelectItem>
                    <SelectItem value="BAND">Band</SelectItem>
                    <SelectItem value="MUSICIAN">Musician</SelectItem>
                    <SelectItem value="PRODUCER">Producer</SelectItem>
                    <SelectItem value="PAINTER">Painter</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newArtist.country}
                  onChange={(e) => setNewArtist({ ...newArtist, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_members">Number of Members</Label>
                <Input
                  id="number_of_members"
                  type="number"
                  min="1"
                  value={newArtist.number_of_members}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : parseInt(e.target.value);
                    setNewArtist({ ...newArtist, number_of_members: value || 1 });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newArtist.email}
                  onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })}
                  required
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newArtist.phone}
                  onChange={(e) => setNewArtist({ ...newArtist, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newArtist.bio}
                  onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newArtist.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setNewArtist({ ...newArtist, status: value, is_active: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Artist</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Artist Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Artist</DialogTitle>
              <DialogDescription>
                Update the artist&apos;s information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateArtist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_artist_name">Name</Label>
                <Input
                  id="edit_artist_name"
                  value={editingArtist?.artist_name || ""}
                  onChange={(e) => setEditingArtist(prev => prev ? {...prev, artist_name: e.target.value} : null)}
                  required
                  className={formErrors.artist_name ? "border-destructive" : ""}
                />
                {formErrors.artist_name && (
                  <p className="text-sm text-destructive">{formErrors.artist_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_artist_type">Type</Label>
                <Select
                  value={editingArtist?.artist_type || "OTHER"}
                  onValueChange={(value: Artist['artist_type']) =>
                    setEditingArtist(prev => prev ? {...prev, artist_type: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DJ">DJ</SelectItem>
                    <SelectItem value="BAND">Band</SelectItem>
                    <SelectItem value="MUSICIAN">Musician</SelectItem>
                    <SelectItem value="PRODUCER">Producer</SelectItem>
                    <SelectItem value="PAINTER">Painter</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_country">Country</Label>
                <Input
                  id="edit_country"
                  value={editingArtist?.country || ""}
                  onChange={(e) => setEditingArtist(prev => prev ? {...prev, country: e.target.value} : null)}
                  className={formErrors.country ? "border-destructive" : ""}
                />
                {formErrors.country && (
                  <p className="text-sm text-destructive">{formErrors.country[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_number_of_members">Number of Members</Label>
                <Input
                  id="edit_number_of_members"
                  type="number"
                  min="1"
                  value={editingArtist?.number_of_members || 1}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : parseInt(e.target.value);
                    setEditingArtist(prev => prev ? {...prev, number_of_members: value || 1} : null);
                  }}
                  className={formErrors.number_of_members ? "border-destructive" : ""}
                />
                {formErrors.number_of_members && (
                  <p className="text-sm text-destructive">{formErrors.number_of_members[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editingArtist?.email || ""}
                  onChange={(e) => setEditingArtist(prev => prev ? {...prev, email: e.target.value} : null)}
                  required
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  type="tel"
                  value={editingArtist?.phone || ""}
                  onChange={(e) => setEditingArtist(prev => prev ? {...prev, phone: e.target.value} : null)}
                  className={formErrors.phone ? "border-destructive" : ""}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive">{formErrors.phone[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_bio">Bio</Label>
                <Textarea
                  id="edit_bio"
                  value={editingArtist?.bio || ""}
                  onChange={(e) => setEditingArtist(prev => prev ? {...prev, bio: e.target.value} : null)}
                  className={formErrors.bio ? "border-destructive" : ""}
                />
                {formErrors.bio && (
                  <p className="text-sm text-destructive">{formErrors.bio[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingArtist?.status || "active"}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingArtist(prev => prev ? {...prev, status: value, is_active: value === "active"} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingArtist(null)
                  setFormErrors({})
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Artist</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {artistsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No artists yet</h2>
              <p className="text-muted-foreground">
                Get started by adding your first artist to your roster. You can manage their bookings, track performances, and more.
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Artist
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No artists found matching your search.</p>
            </div>
          ) : (
            <ArtistGrid 
              artists={filteredArtists} 
              onEdit={handleEditArtist}
              onDelete={(artist) => {
                setArtistsList((prev) => prev.filter((a) => a.id !== artist.id))
              }}
            />
          )}
        </>
      )}
    </div>
  )
}