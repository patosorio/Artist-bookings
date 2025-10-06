import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Receipt } from "lucide-react"
import type { FinancialBreakdown } from "@/types/bookings"

interface FinancialTabProps {
  financial: FinancialBreakdown
}

export function FinancialTab({ financial }: FinancialTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: financial.currency || 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Deal Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deal Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deal Type</span>
              <Badge variant="outline" className="text-base">
                {financial.deal_type}
              </Badge>
            </div>
            {financial.percentage_split !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Percentage Split</span>
                <span className="font-semibold">{financial.percentage_split}%</span>
              </div>
            )}
            {financial.door_percentage !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Door Percentage</span>
                <span className="font-semibold">{financial.door_percentage}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Artist Fee Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Artist Fee Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Guarantee</span>
              <span className="font-medium">{formatCurrency(financial.guarantee_amount)}</span>
            </div>
            {financial.bonus_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bonus</span>
                <span className="font-medium">{formatCurrency(financial.bonus_amount)}</span>
              </div>
            )}
            {financial.expenses_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium">{formatCurrency(financial.expenses_amount)}</span>
              </div>
            )}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="font-semibold">Total Artist Fee</span>
              <span className="font-bold text-lg">
                {formatCurrency(financial.total_artist_fee)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Booking Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Total Booking Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Artist Fee</span>
              <span className="font-medium">{formatCurrency(financial.total_artist_fee)}</span>
            </div>
            {financial.booking_fee_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Booking Fee</span>
                <span className="font-medium">{formatCurrency(financial.booking_fee_amount)}</span>
              </div>
            )}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="font-semibold">Total Cost</span>
              <span className="font-bold text-lg">
                {formatCurrency(financial.total_booking_cost)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

