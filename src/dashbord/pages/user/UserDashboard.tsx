import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import {
  getDailyUserHistory,
  getUserMonthly,
  clearError
} from '../../../store/slices/milkSlicer'
import { getAllMonths } from '../../../store/slices/monthslicer'
import { getdata } from '../../../store/slices/userSlicer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { toast } from "sonner"
import { Calendar, Milk, DollarSign, TrendingUp, History } from 'lucide-react'

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    userHistory, 
    userTotals,
    userHistoryLoading,
    error 
  } = useSelector((state: RootState) => state.milk)
  const { months } = useSelector((state: RootState) => state.months)
  const { data: users } = useSelector((state: RootState) => state.user)

  // For demo purposes, use the first user as current user
  const currentUser = users?.[0] || null

  const [selectedMonthId, setSelectedMonthId] = useState('')

  useEffect(() => {
    dispatch(getAllMonths())
    dispatch(getdata())
    // Get user history automatically for authenticated user
    dispatch(getDailyUserHistory())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleMonthChange = (monthId: string) => {
    setSelectedMonthId(monthId)
    // Note: getUserMonthly is auth-based and gets all months for current user
    dispatch(getUserMonthly())
  }

  const getCurrentMonthTotal = () => {
    const currentMonth = months.find(month => {
      const now = new Date()
      const monthDate = new Date(month.createdAt || '')
      return monthDate.getMonth() === now.getMonth() && 
             monthDate.getFullYear() === now.getFullYear()
    })

    if (currentMonth) {
      return userTotals.find(total => 
        total.userid === currentUser?._id && 
        total.monthid === currentMonth._id
      )
    }
    return null
  }

  const getSelectedMonthTotal = () => {
    if (!selectedMonthId) return null
    return userTotals.find(total => 
      total.userid === currentUser?._id && 
      total.monthid === selectedMonthId
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const currentMonthTotal = getCurrentMonthTotal()
  const selectedMonthTotal = getSelectedMonthTotal()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Milk Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser?.name || 'User'}! Track your milk contributions and earnings.
          </p>
        </div>
      </div>

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">This Month's Milk</CardTitle>
            <Milk className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {currentMonthTotal?.totalMilk?.toFixed(1) || '0.0'} L
            </div>
            <p className="text-xs text-gray-600">Total contributed</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">This Month's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(currentMonthTotal?.totalMoney || 0)}
            </div>
            <p className="text-xs text-gray-600">Total earned</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {currentMonthTotal ? 
                (currentMonthTotal.totalMilk / new Date().getDate()).toFixed(1) : 
                '0.0'
              } L/day
            </div>
            <p className="text-xs text-gray-600">This month's average</p>
          </CardContent>
        </Card>
      </div>

      {/* Month Selection for Historical Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historical Monthly Data
          </CardTitle>
          <CardDescription>
            Select a month to view your milk contribution summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select onValueChange={handleMonthChange} value={selectedMonthId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month._id} value={month._id}>
                      {month.month} ({month.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMonthTotal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Milk</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedMonthTotal.totalMilk.toFixed(1)} L
                        </p>
                      </div>
                      <Milk className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Earnings</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(selectedMonthTotal.totalMoney)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <History className="w-5 h-5" />
            My Daily Milk History
          </CardTitle>
          <CardDescription>
            Complete record of your daily milk contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userHistoryLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your history...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Milk Quantity</TableHead>
                  <TableHead>Amount Earned</TableHead>
                  <TableHead>Fat Content</TableHead>
                  <TableHead>Rate per Liter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      <Milk className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>No milk history available</p>
                      <p className="text-sm">Start contributing milk to see your history here!</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  [...userHistory]
                    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                    .map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium">
                        {entry.createdAt ? formatDate(entry.createdAt) : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {entry.todaymilk.toFixed(1)} L
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-700">
                        {formatCurrency(entry.todaymoney)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                          {entry.todayfit.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {entry.todaymilk > 0 ? 
                          formatCurrency(entry.todaymoney / entry.todaymilk) + '/L' : 
                          'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Days Contributed:</span>
                <span className="font-semibold">{userHistory.length} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average per Day:</span>
                <span className="font-semibold">
                  {userHistory.length > 0 ? 
                    (userHistory.reduce((sum, entry) => sum + entry.todaymilk, 0) / userHistory.length).toFixed(1) : 
                    '0.0'
                  } L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best Single Day:</span>
                <span className="font-semibold text-green-600">
                  {userHistory.length > 0 ? 
                    Math.max(...userHistory.map(entry => entry.todaymilk)).toFixed(1) : 
                    '0.0'
                  } L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-800">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Fat Content:</span>
                <span className="font-semibold">
                  {userHistory.length > 0 ? 
                    (userHistory.reduce((sum, entry) => sum + entry.todayfit, 0) / userHistory.length).toFixed(1) : 
                    '0.0'
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Highest Fat Content:</span>
                <span className="font-semibold text-yellow-600">
                  {userHistory.length > 0 ? 
                    Math.max(...userHistory.map(entry => entry.todayfit)).toFixed(1) : 
                    '0.0'
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rate:</span>
                <span className="font-semibold text-green-600">
                  {userHistory.length > 0 ? 
                    formatCurrency(
                      userHistory.reduce((sum, entry) => sum + (entry.todaymoney / entry.todaymilk || 0), 0) / 
                      userHistory.filter(entry => entry.todaymilk > 0).length || 1
                    ) + '/L' : 
                    '₹0.00/L'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard
