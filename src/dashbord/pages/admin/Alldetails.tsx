import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { fetchAllMilkEntries } from '../../../store/slices/milkSlicer'
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
    const { milkEntries, loading, error } = useSelector((state: RootState) => state.milk)

    useEffect(() => {
        dispatch(fetchAllMilkEntries())
    }, [dispatch])

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
            <CardTitle className="text-2xl font-bold text-green-700">All Milk Entries</CardTitle>
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
                    <TableHead>Milk Quantity (L)</TableHead>
                    <TableHead>Fat Content</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No milk entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    milkEntries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="font-medium">
                          {formatDate(entry.createdAt)}
                        </TableCell>
                        <TableCell>{entry.name}</TableCell>
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
                      <TableCell colSpan={4} className="font-semibold">Total Amount</TableCell>
                      <TableCell className="text-right font-bold text-green-700">
                        ₹{calculateTotal()}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Alldetails
