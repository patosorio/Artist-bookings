import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Coffee, Plane } from "lucide-react"
import type { BookingRequirements } from "@/types/bookings"

interface RequirementsTabProps {
  requirements: BookingRequirements
}

export function RequirementsTab({ requirements }: RequirementsTabProps) {
  return (
    <div className="space-y-6">
      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Technical Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.technical_requirements ? (
            <p className="text-sm whitespace-pre-wrap">{requirements.technical_requirements}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No technical requirements specified</p>
          )}
        </CardContent>
      </Card>

      {/* Hospitality Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Hospitality Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.hospitality_requirements ? (
            <p className="text-sm whitespace-pre-wrap">{requirements.hospitality_requirements}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No hospitality requirements specified</p>
          )}
        </CardContent>
      </Card>

      {/* Travel Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Travel Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.travel_requirements ? (
            <p className="text-sm whitespace-pre-wrap">{requirements.travel_requirements}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No travel requirements specified</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

