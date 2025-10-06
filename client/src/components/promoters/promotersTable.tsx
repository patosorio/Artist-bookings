"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  ToggleLeft, 
  ToggleRight,
  Eye
} from "lucide-react"
import { promoters as promotersApi } from "@/lib/api/promoter-api"
import { promoterKeys } from "@/lib/queries/queryKeys"
import type { Promoter } from "@/types/promoters"

interface PromotersTableProps {
  promoters: Promoter[]
  onEdit?: (promoter: Promoter) => void
  onDelete?: (promoter: Promoter) => void
  onToggleStatus?: (promoter: Promoter) => void
  onDuplicate?: (promoter: Promoter) => void
  onView?: (promoter: Promoter) => void
}

export function PromotersTable({ 
  promoters, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onDuplicate,
  onView 
}: PromotersTableProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Prefetch promoter detail on hover for faster navigation
  const prefetchPromoter = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: promoterKeys.detail(id),
      queryFn: () => promotersApi.fetchPromoter(id),
    })
  }

  const filteredPromoters = promoters.filter((promoter) => {
    const matchesSearch = 
      promoter.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.promoter_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.company_city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || promoter.promoter_type === filterType
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && promoter.is_active) ||
      (filterStatus === "inactive" && !promoter.is_active)

    return matchesSearch && matchesType && matchesStatus
  })

  const getPromoterTypeColor = (type: string) => {
    const colors = {
      festival: "bg-purple-100 text-purple-800",
      club: "bg-blue-100 text-blue-800",
      venue: "bg-green-100 text-green-800",
      agency: "bg-orange-100 text-orange-800",
      private: "bg-gray-100 text-gray-800",
      corporate: "bg-indigo-100 text-indigo-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const promoterTypes = [
    { value: "all", label: "All Types" },
    { value: "festival", label: "Festival" },
    { value: "club", label: "Club" },
    { value: "venue", label: "Venue" },
    { value: "agency", label: "Agency" },
    { value: "private", label: "Private" },
    { value: "corporate", label: "Corporate" }
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search promoters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            {promoterTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromoters.map((promoter) => (
              <TableRow 
                key={promoter.id}
                onMouseEnter={() => prefetchPromoter(promoter.id)}
              >
                <TableCell className="font-medium">
                  {promoter.promoter_name}
                </TableCell>
                <TableCell>{promoter.company_name}</TableCell>
                <TableCell>
                  <Badge className={getPromoterTypeColor(promoter.promoter_type)}>
                    {promoter.promoter_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {promoter.company_city && (
                      <div>{promoter.company_city}</div>
                    )}
                    {promoter.country_name && (
                      <div className="text-muted-foreground">{promoter.country_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {promoter.promoter_email && (
                      <div className="text-blue-600">{promoter.promoter_email}</div>
                    )}
                    {promoter.promoter_phone && (
                      <div className="text-muted-foreground">{promoter.promoter_phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={promoter.is_active ? "default" : "secondary"}>
                    {promoter.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(promoter)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(promoter)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onToggleStatus && (
                        <DropdownMenuItem onClick={() => onToggleStatus(promoter)}>
                          {promoter.is_active ? (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          )}
                          {promoter.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(promoter)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(promoter)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPromoters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || filterType !== "all" || filterStatus !== "all"
              ? "No promoters found matching your filters."
              : "No promoters found."}
          </p>
        </div>
      )}
    </div>
  )
}
