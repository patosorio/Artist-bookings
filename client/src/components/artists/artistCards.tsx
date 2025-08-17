import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { artists } from "@/lib/api/artist-api"
import { toast } from "sonner"
import Link from "next/link"
import type { Artist } from "@/types/artists"

interface ArtistCardProps {
  artist: Artist
  onEdit?: (artist: Artist) => void
  onDelete?: (artist: Artist) => void
}

export function ArtistCard({ artist, onEdit, onDelete }: ArtistCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await artists.delete(artist.id)
      setIsDeleteDialogOpen(false)
      onDelete?.(artist)
      toast.success("Artist deleted successfully")
    } catch (error) {
      console.error("Failed to delete artist:", error)
      toast.error("Failed to delete artist")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{artist.artist_name}</CardTitle>
            <CardDescription>{artist.artist_type}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={artist.status === "active" ? "default" : "secondary"}>
              {artist.status}
            </Badge>
            <Badge variant={artist.is_onboarded ? "default" : "destructive"}>
              {artist.is_onboarded ? "Onboarded" : "Incomplete"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{artist.bio}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Contact:</span>
            <span className="text-sm">{artist.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Phone:</span>
            <span className="text-sm">{artist.phone || 'N/A'}</span>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Link href={`/artists/${artist.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit?.(artist)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {artist.artist_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface ArtistGridProps {
  artists: Artist[]
  onEdit?: (artist: Artist) => void
  onDelete?: (artist: Artist) => void
}

export function ArtistGrid({ artists, onEdit, onDelete }: ArtistGridProps) {
  return (
    <div className="max-w-7xl">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}