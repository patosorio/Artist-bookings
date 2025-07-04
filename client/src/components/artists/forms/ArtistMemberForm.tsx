import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CountrySelect } from "@/components/ui/country-select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"

interface ArtistMemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ArtistMemberFormData) => Promise<void>
  initialData?: Partial<ArtistMemberFormData>
  artistId: string
}

export interface ArtistMemberFormData {
  passport_name: string
  residential_address: string
  country_of_residence: string
  dob: string
  passport_number: string
  passport_expiry: string
  artist_fee: number
  has_withholding: boolean
  withholding_percentage?: number
  payment_method: "BANK_TRANSFER" | "PAYPAL" | "CRYPTO" | "OTHER"
  bank_beneficiary: string
  bank_account_number: string
  bank_address: string
  bank_swift_code: string
  flight_affiliate_program: string
  country_of_departure: string
}

export function ArtistMemberForm({ isOpen, onClose, onSubmit, initialData, artistId }: ArtistMemberFormProps) {
  const [formData, setFormData] = useState<ArtistMemberFormData>({
    passport_name: initialData?.passport_name || "",
    residential_address: initialData?.residential_address || "",
    country_of_residence: initialData?.country_of_residence || "",
    dob: initialData?.dob || "",
    passport_number: initialData?.passport_number || "",
    passport_expiry: initialData?.passport_expiry || "",
    artist_fee: initialData?.artist_fee || 0,
    has_withholding: initialData?.has_withholding || false,
    withholding_percentage: initialData?.withholding_percentage || 0,
    payment_method: initialData?.payment_method || "BANK_TRANSFER",
    bank_beneficiary: initialData?.bank_beneficiary || "",
    bank_account_number: initialData?.bank_account_number || "",
    bank_address: initialData?.bank_address || "",
    bank_swift_code: initialData?.bank_swift_code || "",
    flight_affiliate_program: initialData?.flight_affiliate_program || "",
    country_of_departure: initialData?.country_of_departure || "",
  })

  const handleArtistFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "0" : e.target.value
    const numericValue = parseFloat(value)
    setFormData({ ...formData, artist_fee: isNaN(numericValue) ? 0 : numericValue })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passport_name">Legal Name</Label>
                <Input
                  id="passport_name"
                  value={formData.passport_name}
                  onChange={(e) => setFormData({ ...formData, passport_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Passport Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Passport Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passport_number">Passport Number</Label>
                <Input
                  id="passport_number"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passport_expiry">Passport Expiry</Label>
                <Input
                  id="passport_expiry"
                  type="date"
                  value={formData.passport_expiry}
                  onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Location Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="residential_address">Residential Address</Label>
                <Input
                  id="residential_address"
                  value={formData.residential_address}
                  onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_of_residence">Country of Residence</Label>
                  <CountrySelect
                    value={formData.country_of_residence}
                    onValueChange={(value) => setFormData({ ...formData, country_of_residence: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_of_departure">Country of Departure</Label>
                  <CountrySelect
                    value={formData.country_of_departure}
                    onValueChange={(value) => setFormData({ ...formData, country_of_departure: value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Financial Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artist_fee">Artist Fee</Label>
                  <Input
                    id="artist_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.artist_fee || ""}
                    onChange={handleArtistFeeChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value: ArtistMemberFormData['payment_method']) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="CRYPTO">Crypto</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_withholding"
                  checked={formData.has_withholding}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, has_withholding: checked })}
                />
                <Label htmlFor="has_withholding">Has Withholding Tax</Label>
              </div>
              {formData.has_withholding && (
                <div className="space-y-2">
                  <Label htmlFor="withholding_percentage">Withholding Percentage</Label>
                  <Input
                    id="withholding_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.withholding_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, withholding_percentage: parseInt(e.target.value, 10) })
                    }
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Bank Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Bank Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_beneficiary">Beneficiary Name</Label>
                  <Input
                    id="bank_beneficiary"
                    value={formData.bank_beneficiary}
                    onChange={(e) => setFormData({ ...formData, bank_beneficiary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_address">Bank Address</Label>
                <Input
                  id="bank_address"
                  value={formData.bank_address}
                  onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_swift_code">SWIFT Code</Label>
                <Input
                  id="bank_swift_code"
                  value={formData.bank_swift_code}
                  onChange={(e) => setFormData({ ...formData, bank_swift_code: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Travel Information */}
          <div>
            <h3 className="text-sm font-medium mb-4">Travel Information</h3>
            <div className="space-y-2">
              <Label htmlFor="flight_affiliate_program">Flight Affiliate Program</Label>
              <Input
                id="flight_affiliate_program"
                value={formData.flight_affiliate_program}
                onChange={(e) => setFormData({ ...formData, flight_affiliate_program: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 