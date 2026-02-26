import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getAllMilk, updateMilk, deleteMilk } from '../../../store/slices/milkSlicer'
import { getAllMonths } from "../../../store/slices/monthslicer"
import { getdata } from "../../../store/slices/userSlicer"
import { AdminPDFModal } from './components/AdminPDFModal'
import axios from 'axios'
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { 
  Calendar, Download, FileText, RotateCcw, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, Edit, Search, Filter, PlusCircle, ArrowUpDown, 
  Pencil,
  Trash2
} from "lucide-react"
import { toast } from 'sonner'


interface FilterParams {
  userid?: string
  monthid?: string
  session?: 'morning' | 'night'
  page?: number
  limit?: number
}

interface MilkEntry {
  _id: string
  userid: string
  monthid: string
  session: 'morning' | 'night'
  todaymilk: number
  todayfit: number
  todaymoney: number
  createdAt: string
  updatedAt: string
}

interface UpdateMilkEntryData {
  userid: string
  name: string
  todaymilk: number
  todayfit: number
  todaymoney: number
  session: 'morning' | 'night'
}

const MilkManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { milkEntries, loading, error, pagination } = useSelector((state: RootState) => state.milk)
  const { data } = useSelector((state: RootState) => state.user)
  const { months } = useSelector((state: RootState) => state.months)

  // Filter states
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10
  })
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'night'>('all')
  const [showUserReportModal, setShowUserReportModal] = useState(false)
  
  // Update milk entry state
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<MilkEntry | null>(null)
  const [updateData, setUpdateData] = useState<UpdateMilkEntryData>({
    userid: '',
    name: '',
    todaymilk: 0,
    todayfit: 0,
    todaymoney: 0,
    session: 'morning'
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)

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
    fetchMilkData()
  }, [filters, selectedFilter])

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterParams, value: any) => {
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

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    })
    setSelectedFilter('all')
  }

  // Open update modal with selected entry
  const handleOpenUpdateModal = (entry: MilkEntry) => {
    setSelectedEntry(entry)
    const user = data?.find((u: any) => u._id === entry.userid)
    
    setUpdateData({
      userid: entry.userid,
      name: user?.name || 'Unknown User',
      todaymilk: entry.todaymilk,
      todayfit: entry.todayfit,
      todaymoney: entry.todaymoney,
      session: entry.session
    })
    setUpdateModalOpen(true)
  }

  // Handle input changes for update modal
  const handleUpdateInputChange = (field: keyof UpdateMilkEntryData, value: number) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-calculate money if milk or fat changes (you can adjust this formula)
    if (field === 'todaymilk' || field === 'todayfit') {
      const rate = 80 // Base rate per liter
      const fatBonus = 2 // Rs per fat percentage point
      const milk = field === 'todaymilk' ? value : updateData.todaymilk
      const fat = field === 'todayfit' ? value : updateData.todayfit
      
      const calculatedMoney = milk * (rate + (fat * fatBonus))
      setUpdateData(prev => ({
        ...prev,
        todaymoney: Math.round(calculatedMoney)
      }))
    }
  }

  // Update milk entry
  const handleUpdateMilkEntry = async () => {
    if (!selectedEntry) return
    
    try {
      setUpdateLoading(true)
      
      // Use Redux thunk to update milk entry
      const result = await dispatch(updateMilk({
        id: selectedEntry._id,
        updateData
      })).unwrap()
      
      // Close modal and show success message
      setUpdateModalOpen(false)
      toast.success('Milk entry updated successfully')
      
      // Refresh data
      fetchMilkData()
    } catch (error: any) {
      console.error('Error updating milk entry:', error)
      toast.error(typeof error === 'string' ? error : 'Failed to update milk entry')
    } finally {
      setUpdateLoading(false)
    }
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

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMilk(id)).unwrap();
      toast.success('Milk entry deleted successfully');
      fetchMilkData();
    } catch (error) {
      console.error('Error deleting milk entry:', error);
      toast.error('Error deleting milk entry');
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (id: string) => {
    setDeleteEntryId(id);
    setDeleteModalOpen(true);
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteEntryId) {
      await handleDelete(deleteEntryId);
      setDeleteEntryId(null);
      setDeleteModalOpen(false);
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteEntryId(null);
    setDeleteModalOpen(false);
  }


  return (
    <>
    <div className="container mx-auto px-2 sm:px-4 pb-4 space-y-3 sm:space-y-4">
      {/* Navbar-style header */}
      <div className="relative  bg-white top-0 z-10 p-2 sm:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Milk Management</h1>
            {selectedMonth && (
              <div className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {selectedMonth.month} {selectedMonth.year}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* User Filter */}
                <Select value={filters.userid || 'all'} onValueChange={(value) => handleFilterChange('userid', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                    <SelectItem value="all">All Users</SelectItem>
                    {data?.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month Filter */}
                <Select value={filters.monthid || 'all'} onValueChange={(value) => handleFilterChange('monthid', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                    <SelectItem value="all">All Months</SelectItem>
                    {months?.map((month: any) => (
                      <SelectItem key={month._id} value={month._id}>
                        {month.month} {month.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Session Filter */}
                <Select value={selectedFilter} onValueChange={(value: 'all' | 'morning' | 'night') => setSelectedFilter(value)}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full">
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>

                {/* Records per page */}
                <Select value={String(filters.limit)} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full">
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 rows</SelectItem>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="25">25 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                    <SelectItem value="100">100 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-2 sm:mt-0">
              <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card className="shadow-sm border-blue-100">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl font-bold text-blue-600">{formatNepaliNumber(pagination?.totalItems || 0)}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Records</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-green-100">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl font-bold text-green-600">
              {formatNepaliNumber(Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymilk || 0), 0) * 100) / 100)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Milk (L)</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-purple-100">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl font-bold text-purple-600">
              {formatNepaliNumber(Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymoney || 0), 0) * 100) / 100)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Amount</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-orange-100">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              {formatNepaliNumber(new Set(filteredEntries.map(entry => entry.userid)).size)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Unique Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="shadow-sm">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
            <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-0">Milk Collection Records</div>
            <div className="text-xs sm:text-sm text-gray-500">
              Showing {formatNepaliNumber(filteredEntries.length)} of {formatNepaliNumber(pagination?.totalItems || 0)} records
            </div>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Date</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">User</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Session</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Milk</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Fat%</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Amount</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold hidden sm:table-cell">Month</TableHead>
                  <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold w-[60px] sm:w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry: any) => {
                  const user = data?.find((u: any) => u._id === entry.userid)
                  const month = months?.find((m: any) => m._id === entry.monthid)
                  
                  return (
                    <TableRow key={entry._id} className="text-xs sm:text-sm hover:bg-gray-50">
                      <TableCell className="py-1.5 sm:py-2.5 font-medium whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 max-w-[80px] sm:max-w-none truncate">
                        {user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 capitalize whitespace-nowrap">
                       {entry.session || "NA"} 
                        </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-blue-600 font-semibold whitespace-nowrap">
                        {formatNepaliNumber(entry.todaymilk || 0)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-orange-600 whitespace-nowrap">
                        {formatNepaliNumber(entry.todayfit || 0)}%
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-green-600 font-semibold whitespace-nowrap">
                        Rs.{formatNepaliNumber(entry.todaymoney || 0)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px] sm:text-xs py-0 sm:py-0.5 px-1.5 sm:px-2">
                          {month?.month} {month?.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5">
                        <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-blue-600"
                          onClick={() => handleOpenUpdateModal(entry)}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                          <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600"
                          onClick={() => openDeleteModal(entry._id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>

</div>


                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Page {formatNepaliNumber(pagination.currentPage)} of {formatNepaliNumber(pagination.totalPages)}
                <span className="hidden sm:inline">{' • '} {formatNepaliNumber(pagination.totalItems)} total items</span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage <= 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {/* Page Numbers */}
                {pagination.totalPages && Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 1) {
                    pageNum = pagination.totalPages - 2 + i;
                  } else {
                    pageNum = pagination.currentPage - 1 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-7 sm:h-8 min-w-[28px] sm:min-w-[36px] text-xs sm:text-sm"
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
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User PDF Modal */}
      {data && months && (
        <AdminPDFModal
          isOpen={showUserReportModal}
          onClose={() => setShowUserReportModal(false)}
          months={months || []}
        />
      )}
      
      {/* Update Milk Entry Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Update Milk Entry</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-2 sm:py-4">
            {selectedEntry && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">User</p>
                    <p className="text-sm sm:text-base font-medium">{data?.find((u: any) => u._id === selectedEntry.userid)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm sm:text-base font-medium">{formatDate(selectedEntry.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Session</p>
                    <p className="text-sm sm:text-base font-medium">{selectedEntry.session === 'morning' ? 'Morning' : 'Night'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Month</p>
                    <p className="text-sm sm:text-base font-medium">
                      {months?.find((m: any) => m._id === selectedEntry.monthid)?.month} 
                      {' '} 
                      {months?.find((m: any) => m._id === selectedEntry.monthid)?.year}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="milk" className="text-xs sm:text-sm">Milk Quantity (Liters)</Label>
                  <Input
                    id="milk"
                    type="number"
                    step="0.01"
                    value={updateData.todaymilk}
                    onChange={(e) => handleUpdateInputChange('todaymilk', parseFloat(e.target.value))}
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="fat" className="text-xs sm:text-sm">Fat Percentage</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={updateData.todayfit}
                    onChange={(e) => handleUpdateInputChange('todayfit', parseFloat(e.target.value))}
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="money" className="text-xs sm:text-sm">Amount (Rs.)</Label>
                  <Input
                    id="money"
                    type="number"
                    value={updateData.todaymoney}
                    onChange={(e) => handleUpdateInputChange('todaymoney', parseFloat(e.target.value))}
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500">Automatically calculated based on milk and fat</p>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setUpdateModalOpen(false)}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateMilkEntry} 
              disabled={updateLoading}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {updateLoading ? (
                <>
                  <div className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Updating...
                </>
              ) : (
                'Update Entry'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Confirm Delete"
        description="Are you sure you want to delete this milk entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
    </>
  )
}

export default MilkManagement
