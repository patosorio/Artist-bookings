import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, AlertCircle } from "lucide-react"
import type { ContractStatusSummary } from "@/types/bookings"

interface ContractStatusCardProps {
  contractStatus: ContractStatusSummary
  formatDate: (date?: string) => string
}

export function ContractStatusCard({ contractStatus, formatDate }: ContractStatusCardProps) {
  const getStatusColor = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "paid":
      case "signed":
        return "default"
      case "sent":
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract & Invoice Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Contract Status</span>
            <Badge variant={getStatusColor(contractStatus.contract_status)}>
              {contractStatus.contract_status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            {contractStatus.contract_sent_date && (
              <p>Sent: {formatDate(contractStatus.contract_sent_date)}</p>
            )}
            {contractStatus.contract_signed_date && (
              <p>Signed: {formatDate(contractStatus.contract_signed_date)}</p>
            )}
          </div>
        </div>

        {/* Artist Fee Invoice */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Artist Fee Invoice</span>
          </div>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={getStatusColor(contractStatus.artist_fee_invoice_status)}>
                {contractStatus.artist_fee_invoice_status}
              </Badge>
            </div>
            {contractStatus.artist_fee_invoice_sent_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sent</span>
                <span>{formatDate(contractStatus.artist_fee_invoice_sent_date)}</span>
              </div>
            )}
            {contractStatus.artist_fee_invoice_due_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due</span>
                <span>{formatDate(contractStatus.artist_fee_invoice_due_date)}</span>
              </div>
            )}
            {contractStatus.artist_fee_invoice_paid_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span>{formatDate(contractStatus.artist_fee_invoice_paid_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Fee Invoice */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Booking Fee Invoice</span>
          </div>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={getStatusColor(contractStatus.booking_fee_invoice_status)}>
                {contractStatus.booking_fee_invoice_status}
              </Badge>
            </div>
            {contractStatus.booking_fee_invoice_sent_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sent</span>
                <span>{formatDate(contractStatus.booking_fee_invoice_sent_date)}</span>
              </div>
            )}
            {contractStatus.booking_fee_invoice_due_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due</span>
                <span>{formatDate(contractStatus.booking_fee_invoice_due_date)}</span>
              </div>
            )}
            {contractStatus.booking_fee_invoice_paid_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span>{formatDate(contractStatus.booking_fee_invoice_paid_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Warning */}
        {contractStatus.artist_fee_invoice_status === "Overdue" ||
          (contractStatus.booking_fee_invoice_status === "Overdue" && (
            <div className="pt-4 border-t flex items-start gap-2 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>One or more invoices are overdue</span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

