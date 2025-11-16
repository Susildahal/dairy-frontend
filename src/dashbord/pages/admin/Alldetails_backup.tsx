import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { getAllMilk } from '../../../store/slices/milkSlicer'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sun, Moon, Filter, FileText, Download, RotateCcw } from "lucide-react"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Alldetails = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { milkEntries, loading, error, pagination } = useSelector((state: RootState) => state.milk)
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'night'>('all')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const filters: any = { page: currentPage, limit: 20 }
        if (selectedFilter !== 'all') {
            filters.session = selectedFilter
        }
        dispatch(getAllMilk(filters))
    }, [dispatch, selectedFilter, currentPage])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const calculateTotal = () => {
        return milkEntries.reduce((total, entry) => total + (entry.todaymoney || 0), 0)
    }

    // Reset filters
    const handleResetFilters = () => {
        setSelectedFilter('all')
        setCurrentPage(1)
    }

    // PDF Download
    const handlePDFDownload = () => {
        const params = new URLSearchParams()
        params.append('page', String(currentPage))
        params.append('limit', '20')
        if (selectedFilter !== 'all') {
            params.append('session', selectedFilter)
        }
        params.append('format', 'pdf')
        
        window.open(`${process.env.VITE_API_BASE_URL}/milk/allmilk?${params.toString()}`, '_blank')
    }

    // CSV Export
    const handleExport = () => {
        const params = new URLSearchParams()
        params.append('page', String(currentPage))
        params.append('limit', '20')
        if (selectedFilter !== 'all') {
            params.append('session', selectedFilter)
        }
        params.append('export', 'true')
        
        window.open(`${process.env.VITE_API_BASE_URL}/milk/allmilk?${params.toString()}`, '_blank')
    }
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="All Milk Entries"
        subtitle="View all milk entries recorded in the system"
        linkname="Add Milk Entry"
        linkto="/admin/milk"
      />
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-green-700">All Milk Entries</CardTitle>
              
              {/* Session Filter */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'all' 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  All Sessions
                </Button>
                
                <Button
                  variant={selectedFilter === 'morning' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('morning')}
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'morning' 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Morning
                </Button>
                
                <Button
                  variant={selectedFilter === 'night' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('night')}
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'night' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Night
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {selectedFilter === 'all' && `Showing all milk entries (${pagination.totalItems} total)`}
              {selectedFilter === 'morning' && `Showing morning collection entries (${pagination.totalItems} entries)`}
              {selectedFilter === 'night' && `Showing night collection entries (${pagination.totalItems} entries)`}
              • Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </CardHeader>
          <CardContent>
            {loading && <Loading />}
            {error && (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">
                Error: {error}
              </div>
            )}
            
            {!loading && !error && (
              <Table>
                <TableCaption>
                  Complete list of all milk entries in the system
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Milk Quantity (L)</TableHead>
                    <TableHead>Fat Content</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {selectedFilter === 'all' 
                          ? 'No milk entries found' 
                          : `No ${selectedFilter} milk entries found`
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    milkEntries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="font-medium">
                          {formatDate(entry.createdAt)}
                        </TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${
                              entry.session === 'morning' 
                                ? 'border-orange-300 text-orange-700 bg-orange-50' 
                                : 'border-indigo-300 text-indigo-700 bg-indigo-50'
                            }`}
                          >
                            {entry.session === 'morning' ? (
                              <>
                                <Sun className="w-3 h-3 mr-1" />
                                Morning
                              </>
                            ) : (
                              <>
                                <Moon className="w-3 h-3 mr-1" />
                                Night
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.todaymilk} L</TableCell>
                        <TableCell>{entry.todayfit}%</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{entry.todaymoney}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {milkEntries.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="font-semibold">Total Amount</TableCell>
                      <TableCell className="text-right font-bold text-green-700">
                        ₹{calculateTotal()}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Alldetails
