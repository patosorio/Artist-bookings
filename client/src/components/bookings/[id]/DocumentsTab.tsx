import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  FileText,
  Plus,
  Upload,
  Eye,
  Download,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import type { BookingDocument, EnrichedBooking } from "@/types/bookings"

interface NewDocumentForm {
  type: "contract" | "invoice" | "rider" | "itinerary" | "settlement" | "other"
  category: "promoter_contract" | "artist_invoice" | "promoter_invoice" | "rider" | "settlement" | "other"
  name: string
  amount: number
}

interface DocumentsTabProps {
  booking: EnrichedBooking
  documents: BookingDocument[]
  isUploadDialogOpen: boolean
  setIsUploadDialogOpen: (open: boolean) => void
  newDocument: NewDocumentForm
  setNewDocument: React.Dispatch<React.SetStateAction<NewDocumentForm>>
  handleUploadDocument: (e: React.FormEvent) => void
  handleSendDocument: (docId: string) => void
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline"
  getStatusIcon: (status: string) => any
}

export function DocumentsTab({
  booking,
  documents,
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  newDocument,
  setNewDocument,
  handleUploadDocument,
  handleSendDocument,
  getStatusColor,
  getStatusIcon,
}: DocumentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents & Contracts
            </CardTitle>
            <CardDescription>
              Manage all booking-related documents (Backend integration pending)
            </CardDescription>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Add a new document to this booking.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={newDocument.type}
                    onValueChange={(value: NewDocumentForm["type"]) =>
                      setNewDocument((prev: NewDocumentForm) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="rider">Rider</SelectItem>
                      <SelectItem value="itinerary">Itinerary</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newDocument.category}
                    onValueChange={(value: NewDocumentForm["category"]) =>
                      setNewDocument((prev: NewDocumentForm) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promoter_contract">Promoter Contract</SelectItem>
                      <SelectItem value="artist_invoice">Artist Invoice</SelectItem>
                      <SelectItem value="promoter_invoice">Promoter Invoice</SelectItem>
                      <SelectItem value="rider">Technical Rider</SelectItem>
                      <SelectItem value="settlement">Settlement Sheet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={newDocument.name}
                    onChange={(e) => setNewDocument((prev: NewDocumentForm) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Performance Contract.pdf"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (if applicable)</Label>
                  <Input
                    type="number"
                    value={newDocument.amount}
                    onChange={(e) =>
                      setNewDocument((prev: NewDocumentForm) => ({
                        ...prev,
                        amount: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Upload Document
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const StatusIcon = getStatusIcon(doc.status)
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded by {doc.uploadedBy} •{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {doc.category.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(doc.status)} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.amount ? `$${doc.amount.toLocaleString()}` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendDocument(doc.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Promoter Contract</p>
                <div className="flex items-center gap-2">
                  {documents.find((d) => d.category === "promoter_contract")?.status ===
                  "signed" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Signed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Promoter Invoice</p>
                <div className="flex items-center gap-2">
                  {documents.find((d) => d.category === "promoter_invoice")?.status === "sent" ? (
                    <>
                      <Send className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Sent</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Draft</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Artist Invoice</p>
                <div className="flex items-center gap-2">
                  {documents.find((d) => d.category === "artist_invoice") ? (
                    <>
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Created</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Missing</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the Upload button to add documents
            </p>
          </div>
        )}

        {/* Contract Status from Backend */}
        {booking.contract_status_summary && (
          <>
            <Separator className="my-6" />
            <div>
              <h4 className="text-sm font-medium mb-3">Contract Status (From Backend)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded">
                  <p className="text-xs text-muted-foreground">Contract Status</p>
                  <Badge
                    variant={getStatusColor(booking.contract_status_summary.contract_status)}
                    className="mt-1"
                  >
                    {booking.contract_status_summary.contract_status}
                  </Badge>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-xs text-muted-foreground">Artist Fee Invoice</p>
                  <Badge
                    variant={getStatusColor(
                      booking.contract_status_summary.artist_fee_invoice_status
                    )}
                    className="mt-1"
                  >
                    {booking.contract_status_summary.artist_fee_invoice_status}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

