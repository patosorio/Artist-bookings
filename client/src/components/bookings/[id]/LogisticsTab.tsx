import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Truck, Hotel, Utensils, Package, Plus, Trash2, User, Phone, Mail } from "lucide-react"
import type { BookingLogistics } from "@/types/bookings"

interface LogisticsTabProps {
  logistics: BookingLogistics[]
  isLogisticsDialogOpen: boolean
  setIsLogisticsDialogOpen: (open: boolean) => void
  newLogistics: Partial<BookingLogistics>
  setNewLogistics: React.Dispatch<React.SetStateAction<Partial<BookingLogistics>>>
  handleAddLogistics: (e: React.FormEvent) => void
  handleDeleteLogistics: (id: string) => void
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline"
}

export function LogisticsTab({
  logistics,
  isLogisticsDialogOpen,
  setIsLogisticsDialogOpen,
  newLogistics,
  setNewLogistics,
  handleAddLogistics,
  handleDeleteLogistics,
  getStatusColor,
}: LogisticsTabProps) {
  const getLogisticsIcon = (type: string) => {
    switch (type) {
      case "transport":
        return Truck
      case "accommodation":
        return Hotel
      case "catering":
        return Utensils
      case "equipment":
        return Package
      default:
        return Package
    }
  }

  const totalLogisticsCost = logistics.reduce((sum, l) => sum + (l.cost || 0), 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Logistics & Travel
            </CardTitle>
            <CardDescription>
              Manage transport, accommodation, and other logistics (Backend integration pending)
            </CardDescription>
          </div>
          <Dialog open={isLogisticsDialogOpen} onOpenChange={setIsLogisticsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Logistics
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Logistics Item</DialogTitle>
                <DialogDescription>
                  Add transport, accommodation, or other logistics.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLogistics} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newLogistics.type}
                    onValueChange={(value: any) =>
                      setNewLogistics((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newLogistics.description}
                    onChange={(e) =>
                      setNewLogistics((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      value={newLogistics.provider}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({ ...prev, provider: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost</Label>
                    <Input
                      type="number"
                      value={newLogistics.cost}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({
                          ...prev,
                          cost: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={newLogistics.contactName}
                    onChange={(e) =>
                      setNewLogistics((prev) => ({ ...prev, contactName: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={newLogistics.contactPhone}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={newLogistics.contactEmail}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newLogistics.date}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({ ...prev, date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newLogistics.time}
                      onChange={(e) =>
                        setNewLogistics((prev) => ({ ...prev, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newLogistics.status}
                    onValueChange={(value: any) =>
                      setNewLogistics((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newLogistics.notes}
                    onChange={(e) =>
                      setNewLogistics((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Logistics Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {logistics.length > 0 ? (
          <>
            {logistics.map((item) => {
              const LogisticsIcon = getLogisticsIcon(item.type)
              return (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <LogisticsIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {item.description}
                          <Badge variant={getStatusColor(item.status)} className="text-xs">
                            {item.status}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.provider && `${item.provider} • `}
                          {new Date(item.date).toLocaleDateString()}
                          {item.time && ` at ${item.time}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.cost && (
                        <span className="text-sm font-medium">${item.cost.toLocaleString()}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLogistics(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(item.contactName || item.contactPhone || item.contactEmail) && (
                    <div className="mb-3 pl-14 space-y-1">
                      {item.contactName && (
                        <p className="text-sm flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {item.contactName}
                        </p>
                      )}
                      {item.contactPhone && (
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {item.contactPhone}
                        </p>
                      )}
                      {item.contactEmail && (
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {item.contactEmail}
                        </p>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <div className="pl-14">
                      <p className="text-sm text-muted-foreground italic">{item.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Logistics Cost</span>
                <span className="text-lg font-bold">${totalLogisticsCost.toLocaleString()}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No logistics items yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the Add Logistics button to add items
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

