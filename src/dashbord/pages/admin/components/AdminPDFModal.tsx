import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText, AlertCircle } from 'lucide-react'
import { generateUserMonthlyPDF } from '../utils/pdfUtils'
import { getAllMilk } from '../../../../store/slices/milkSlicer'
import { getdata } from '../../../../store/slices/userSlicer'
import { AppDispatch, RootState } from '../../../../store/store'

interface AdminPDFModalProps {
  isOpen: boolean
  onClose: () => void
  months: any[]
}

export const AdminPDFModal: React.FC<AdminPDFModalProps> = ({
  isOpen,
  onClose,
  months,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  // Pull users already in Redux store first
  const storeUsers = useSelector((state: RootState) => state.user.data)
  const [allUsers, setAllUsers] = useState<any[]>(() =>
    storeUsers.filter((u: any) => u.role === 'user')
  )
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  // Sync from Redux store whenever it updates
  useEffect(() => {
    const filtered = storeUsers.filter((u: any) => u.role === 'user')
    if (filtered.length > 0) setAllUsers(filtered)
  }, [storeUsers])

  // Fetch all users when modal opens (only if not already loaded)
  useEffect(() => {
    if (isOpen && allUsers.length === 0) {
      fetchAllUsers()
    }
  }, [isOpen])

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await dispatch(getdata())
      if (response.payload) {
        const users = (response.payload as any[]).filter((u: any) => u.role === 'user')
        setAllUsers(users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showMessage('Failed to load users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(message)
    setMessageType(type)
    setTimeout(() => setStatusMessage(''), 5000)
  }

  // Generate PDF for a single user
  const handleGenerateUserPDF = async () => {
    if (!selectedUser || !selectedMonth) {
      showMessage('Please select both user and month', 'error')
      return
    }
    try {
      setLoadingData(true)
      showMessage('Fetching data and generating PDF...', 'info')

      const response = await dispatch(getAllMilk({
        userid: selectedUser,
        monthid: selectedMonth,
        limit: 999999,
      }))

      if (response.payload && (response.payload as any).data) {
        const userData = (response.payload as any).data
        if (userData.length === 0) {
          showMessage('No data found for selected user and month', 'error')
          return
        }
        const user = allUsers.find(u => u._id === selectedUser)
        const month = months.find(m => m._id === selectedMonth)
        await generateUserMonthlyPDF(userData, user?.name || 'Unknown User', month)
        showMessage('PDF downloaded successfully!', 'success')
      } else {
        showMessage('No data returned from server', 'error')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      showMessage('Error generating PDF. Please try again.', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  const handleClose = () => {
    setSelectedUser('')
    setSelectedMonth('')
    setStatusMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-auto max-h-[95vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-blue-700">
              PDF Report Generator
            </CardTitle>
            <Button onClick={handleClose} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0">
              ✕
            </Button>
          </div>
          <p className="text-gray-600 text-sm">Generate and download PDF reports</p>
          <p className="text-blue-600 text-xs mt-1">
            {loadingUsers ? 'Loading users...' : `${allUsers.length} users · ${months.length} months`}
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Month *</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                {months && months.length > 0 ? (
                  months.map((month: any) => (
                    <SelectItem key={month._id} value={month._id}>
                      {month.month} {month.year}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No months available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
              <Label className="text-base font-semibold">Select User *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                  {loadingUsers ? (
                    <div className="p-2 text-sm text-gray-500">Loading users...</div>
                  ) : allUsers.length > 0 ? (
                    allUsers.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} {user.tagnumber ? `(${user.tagnumber})` : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No users available</div>
                  )}
                </SelectContent>
              </Select>
              {!loadingUsers && allUsers.length === 0 && (
                <p className="text-red-500 text-xs">No users found.</p>
              )}
            </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-50 text-green-700' :
              messageType === 'error'   ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {messageType === 'error' && <AlertCircle className="w-4 h-4" />}
                {statusMessage}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateUserPDF}
            disabled={loadingData || !selectedUser || !selectedMonth}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loadingData ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>

          <Button onClick={handleClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
