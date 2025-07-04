import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"
import type { Artist } from "@/types/artists"

interface ArtistCardProps {
  artist: Artist
  onEdit?: (artist: Artist) => void
}

export function ArtistCard({ artist, onEdit }: ArtistCardProps) {
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
        </div>
      </CardContent>
    </Card>
  )
}

interface ArtistGridProps {
  artists: Artist[]
  onEdit?: (artist: Artist) => void
}

export function ArtistGrid({ artists, onEdit }: ArtistGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} onEdit={onEdit} />
      ))}
    </div>
  )
}