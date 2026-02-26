import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getAllMilk } from '../../../store/slices/milkSlicer'
import { getAllMonths } from "../../../store/slices/monthslicer"
import { getdata } from "../../../store/slices/userSlicer"
import { UserPDFModal } from '../admin/components/UserPDFModal'
import { useAuth } from '../../../hooks/useAuth'
import {Header} from '../../common/Header'
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import {  FileText, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useLocation } from 'react-router-dom'

interface FilterParams {
  userid?: string
  monthid?: string
  session?: 'morning' | 'night'
  page?: number
  limit?: number
}


const UserLoginDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { milkEntries, loading, error, pagination } = useSelector((state: RootState) => state.milk)
  const { data } = useSelector((state: RootState) => state.user)
  const { months } = useSelector((state: RootState) => state.months)
  const user = useSelector((state: RootState) => state.mee)
  const { user: authUser } = useAuth() // Get authenticated user from useAuth hook
  console.log('User from mee slice:', user)
  console.log('Auth user:', authUser)
  const location = useLocation()
  // get current path from react-router
  const currentPath = location.pathname // e.g. "/dashboard/user"
  const currentFullPath = location.pathname + location.search + location.hash // includes query and hash

  // optional: keep in state to react to changes
  const [currentRoute, setCurrentRoute] = useState(location.pathname)
  useEffect(() => {
    setCurrentRoute(location.pathname)
  }, [location.pathname])
  console.log('Current full path:', currentFullPath)

  // example: log when path changes
  useEffect(() => {
    console.log('Current path:', currentPath)
  }, [currentPath])
  // Filter states
  const [filters, setFilters] = useState<FilterParams>(
    authUser ? {
     page: 1,
      limit: 10,
      userid: authUser._id
    } : {
      page: 1, 
      limit: 10
    }
  )
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'night'>('all')
  const [showUserReportModal, setShowUserReportModal] = useState(false)

  useEffect(() => {
    if(!months || months.length === 0)
      dispatch(getAllMonths())
  }, [dispatch, months])

  useEffect(() => {
    if(!data || data.length === 0)
      dispatch(getdata())
  }, [dispatch, data])

  // Fetch milk data with filters
  const fetchMilkData = () => {
    const params: any = { ...filters }
    if (selectedFilter !== 'all') {
      params.session = selectedFilter
    }
    dispatch(getAllMilk(params))
  }

  useEffect(() => {
    fetchMilkData(
    )
  }, [filters, selectedFilter])

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    // For UserDashboard, don't allow changing the userid - it should always be the logged-in user
    if (key === 'userid' && authUser) {
      return
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Reset all filters except userid
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    })
    setSelectedFilter('all')
  }

  // Export to CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    })
    if (selectedFilter !== 'all') {
      params.append('session', selectedFilter)
    }
    params.append('export', 'csv')
    
    window.open(`${process.env.VITE_API_BASE_URL}/milk/allmilk?${params.toString()}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  // Fixed formatNepaliNumber function to handle non-numeric inputs safely
  const formatNepaliNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '०'
    
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    return num.toString().replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)] || digit)
  }

  const filteredEntries = useMemo(() => {
    return milkEntries || []
  }, [milkEntries])

  const selectedMonth = filters.monthid ? months?.find(m => m._id === filters.monthid) : null

  if (loading && (!milkEntries || milkEntries.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading milk management data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <>
  <Header/>
    <div className="container mx-auto p-4 space-y-4">
      

      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">My Milk Collection</h1>
          {authUser && (
            <p className="text-sm text-gray-600 mt-1">Name: {authUser.name}</p>
          )}
        </div>
        <Button onClick={() => setShowUserReportModal(true)} variant="outline" className='cursor-pointer' size="sm">
          <FileText className="w-4 h-4 mr-2" />
          PDF Reports
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button onClick={handleResetFilters} variant="ghost" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Month Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Month</Label>
            <Select value={filters.monthid || 'all'} onValueChange={(value) => handleFilterChange('monthid', value === 'all' ? undefined : value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months?.map((month: any) => (
                  <SelectItem key={month._id} value={month._id}>
                    {month.month} {month.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Session</Label>
            <Select value={selectedFilter} onValueChange={(value: 'all' | 'morning' | 'night') => setSelectedFilter(value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records per page */}
          <div className="space-y-1">
            <Label className="text-sm">Records per page</Label>
            <Select value={String(filters.limit)} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold">{formatNepaliNumber(pagination?.totalItems || 0)}</div>
          <div className="text-xs text-gray-600">Total Records</div>
        </div>
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold text-green-600">
            {formatNepaliNumber(
              Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymilk || 0), 0) * 100) / 100
            )}
          </div>
          <div className="text-xs text-gray-600">Total Milk (L)</div>
        </div>
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold text-blue-600">
            {formatNepaliNumber(
              Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymoney || 0), 0) * 100) / 100
            )}
          </div>
          <div className="text-xs text-gray-600">Total Amount (Rs.)</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded border">
        <div className="p-3 border-b">
          <h2 className="font-semibold">Records</h2>
          <p className="text-xs text-gray-600">
            Showing {formatNepaliNumber(filteredEntries.length)} of {formatNepaliNumber(pagination?.totalItems || 0)} records
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Milk (L)</TableHead>
                <TableHead>Fat %</TableHead>
                <TableHead>Amount (Rs.)</TableHead>
                <TableHead>Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry: any) => {
                const month = months?.find((m: any) => m._id === entry.monthid)
                
                return (
                  <TableRow key={entry._id}>
                    <TableCell className="font-medium">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.session === 'morning' ? 'default' : 'secondary'} className="text-xs">
                        {entry.session === 'morning' ? 'Morning' : 'Night'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNepaliNumber(entry.todaymilk || 0)}
                    </TableCell>
                    <TableCell>
                      {formatNepaliNumber(entry.todayfit || 0)}%
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rs. {formatNepaliNumber(entry.todaymoney || 0)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {month?.month} {month?.year}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t">
            <div className="text-xs text-gray-600">
              Page {formatNepaliNumber(pagination.currentPage)} of {formatNepaliNumber(pagination.totalPages)}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>      
              
              {/* Page Numbers */}
              {pagination.totalPages && Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-7 h-7 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User PDF Modal */}
      {data && months && authUser && (
        <UserPDFModal
          isOpen={showUserReportModal}
          onClose={() => setShowUserReportModal(false)}
          user={data.find((u: any) => u._id === authUser._id)}
          months={months || []}
        />
      )}
    </div>
    </>
  )
}

export default UserLoginDashboard
