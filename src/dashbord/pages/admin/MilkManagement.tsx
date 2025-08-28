import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import {
  saveMilk,
  getAllMilk,
  getDailyUserHistory,
  getAdminTotal,
  getUserMonthly,
  getTotalMonth,
  clearError
} from '../../../store/slices/milkSlicer'
import { getdata } from '../../../store/slices/userSlicer'
import { getAllMonths } from '../../../store/slices/monthslicer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { toast } from "sonner"
import { Plus, Eye, TrendingUp, Users, DollarSign, Milk } from 'lucide-react'

interface MilkFormData {
  userid: string
  name: string
  todaymilk: number
  todaymoney: number
  todayfit: number
}

const MilkManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    milkEntries, 
    userTotals, 
    adminTotals, 
    userHistory, 
    monthTotals,
    loading, 
    saveLoading, 
    userHistoryLoading,
    monthTotalsLoading,
    error 
  } = useSelector((state: RootState) => state.milk)
  const { data: users } = useSelector((state: RootState) => state.user)
  const { months } = useSelector((state: RootState) => state.months)

  const [isAddMilkOpen, setIsAddMilkOpen] = useState(false)
  const [isUserHistoryOpen, setIsUserHistoryOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedMonthId, setSelectedMonthId] = useState('')
  const [formData, setFormData] = useState<MilkFormData>({
    userid: '',
    name: '',
    todaymilk: 0,
    todaymoney: 0,
    todayfit: 0
  })

  useEffect(() => {
    dispatch(getdata())
    dispatch(getAllMonths())
    dispatch(getAllMilk())
    dispatch(getUserMonthly())
    dispatch(getAdminTotal())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleAddMilk = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userid || !formData.name || formData.todaymilk <= 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await dispatch(saveMilk(formData)).unwrap()
      toast.success('Milk entry added successfully!')
      setFormData({
        userid: '',
        name: '',
        todaymilk: 0,
        todaymoney: 0,
        todayfit: 0
      })
      setIsAddMilkOpen(false)
      
      // Refresh data
      dispatch(getAllMilk())
      dispatch(getUserMonthly())
      dispatch(getAdminTotal())
    } catch (error: any) {
      toast.error(error.message || 'Failed to add milk entry')
    }
  }

  const handleUserSelect = (userid: string) => {
    const selectedUser = users.find(user => user._id === userid)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        userid: selectedUser._id,
        name: selectedUser.name
      }))
    }
  }

  const handleViewUserHistory = (userid: string) => {
    setSelectedUserId(userid)
    // Note: Since dailyuserhistory is auth-based in backend, 
    // this won't work for viewing other users. Admin needs a separate endpoint.
    dispatch(getDailyUserHistory())
    setIsUserHistoryOpen(true)
  }

  const handleViewMonthTotals = () => {
    dispatch(getTotalMonth())
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Milk Management</h1>
          <p className="text-gray-600 mt-1">Manage daily milk collection and track totals</p>
        </div>
        
        <Dialog open={isAddMilkOpen} onOpenChange={setIsAddMilkOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Milk Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-800">Add New Milk Entry</DialogTitle>
              <DialogDescription>
                Record today's milk collection for a user
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddMilk} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Select User *</Label>
                  <Select onValueChange={handleUserSelect} value={formData.userid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="todaymilk">Today's Milk (Liters) *</Label>
                  <Input
                    id="todaymilk"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.todaymilk || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      todaymilk: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter milk quantity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="todaymoney">Today's Money (₹) *</Label>
                  <Input
                    id="todaymoney"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.todaymoney || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      todaymoney: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="todayfit">Fat Content (%)</Label>
                  <Input
                    id="todayfit"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.todayfit || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      todayfit: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter fat percentage"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMilkOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saveLoading ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Milk</CardTitle>
            <Milk className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {adminTotals?.reduce((sum, total) => sum + total.totalMilk, 0)?.toFixed(1) || '0.0'} L
            </div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(adminTotals?.reduce((sum, total) => sum + total.totalMoney, 0) || 0)}
            </div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {userTotals.length}
            </div>
            <p className="text-xs text-gray-600">Contributing this month</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Daily Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {milkEntries.length}
            </div>
            <p className="text-xs text-gray-600">Today's collections</p>
          </CardContent>
        </Card>
      </div>

      {/* User Totals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">User Totals - Current Month</CardTitle>
          <CardDescription>
            Monthly milk collection and payment summary for each user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Total Milk (L)</TableHead>
                <TableHead>Total Money (₹)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTotals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No user totals available
                  </TableCell>
                </TableRow>
              ) : (
                userTotals.map((userTotal) => (
                  <TableRow key={userTotal._id}>
                    <TableCell className="font-medium">{userTotal.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {userTotal.totalMilk.toFixed(1)} L
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(userTotal.totalMoney)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUserHistory(userTotal.userid)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View History
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Today's Milk Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">Today's Milk Entries</CardTitle>
          <CardDescription>
            All milk collection entries for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading entries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Milk (L)</TableHead>
                  <TableHead>Money (₹)</TableHead>
                  <TableHead>Fat (%)</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No entries for today
                    </TableCell>
                  </TableRow>
                ) : (
                  milkEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {entry.todaymilk.toFixed(1)} L
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.todaymoney)}</TableCell>
                      <TableCell>{entry.todayfit.toFixed(1)}%</TableCell>
                      <TableCell className="text-gray-600">
                        {entry.createdAt ? formatDate(entry.createdAt) : 'Today'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User History Dialog */}
      <Dialog open={isUserHistoryOpen} onOpenChange={setIsUserHistoryOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-green-800">User Milk History</DialogTitle>
            <DialogDescription>
              Complete milk collection history for selected user
            </DialogDescription>
          </DialogHeader>
          
          {userHistoryLoading ? (
            <div className="text-center py-8">Loading user history...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Milk (L)</TableHead>
                  <TableHead>Money (₹)</TableHead>
                  <TableHead>Fat (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No history available
                    </TableCell>
                  </TableRow>
                ) : (
                  userHistory.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{entry.createdAt ? formatDate(entry.createdAt) : 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {entry.todaymilk.toFixed(1)} L
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.todaymoney)}</TableCell>
                      <TableCell>{entry.todayfit.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MilkManagement
