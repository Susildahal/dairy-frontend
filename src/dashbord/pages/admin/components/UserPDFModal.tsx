import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText,  AlertCircle } from 'lucide-react'
import { generateUserMonthlyPDF, generateAllUsersPDF } from '../utils/pdfUtils'
import { getAllMilk } from '../../../../store/slices/milkSlicer'
import { getdata } from '../../../../store/slices/userSlicer'
import { AppDispatch } from '../../../../store/store'

interface UserPDFModalProps {
  isOpen: boolean
  onClose: () => void
  users: any[]
  months: any[]
}

export const UserPDFModal: React.FC<UserPDFModalProps> = ({
  isOpen,
  onClose,
  users: usersProp,
  months
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [reportType, setReportType] = useState<'single' | 'all'>('single')
  const [statusMessage, setStatusMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllUsers()
    }
  }, [isOpen])

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await dispatch(getdata())
      if (response.payload) {
        // Filter only users with role 'user'
        const users = (response.payload as any[]).filter((user: any) => user.role === 'user')
        setAllUsers(users)
        console.log('UserPDFModal - Fetched users from API:', users.length)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showMessage('Failed to load users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  // Function to show status messages
  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(message)
    setMessageType(type)
    setTimeout(() => {
      setStatusMessage('')
    }, 5000) // Clear message after 5 seconds
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
      
      // Fetch user data
      const response = await dispatch(getAllMilk({
        userid: selectedUser,
        monthid: selectedMonth,
        limit: 999999 // Get all records
      }))
      
      if (response.payload && (response.payload as any).data) {
        const userData = (response.payload as any).data
        
        if (userData.length === 0) {
          showMessage('No data found for selected user and month', 'error')
          return
        }
        
        const user = allUsers.find(u => u._id === selectedUser)
        const month = months.find(m => m._id === selectedMonth)
        
        // Generate the PDF (async to load fonts)
        await generateUserMonthlyPDF(userData, user?.name || 'Unknown User', month)
        showMessage('PDF generated successfully!', 'success')
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

  // Generate PDF for all users in a month
  const handleGenerateAllUsersPDF = async () => {
    if (!selectedMonth) {
      showMessage('Please select a month', 'error')
      return
    }

    try {
      setLoadingData(true)
      showMessage('Fetching data for all users and generating PDF...', 'info')
      
      // Fetch all users data for the selected month
      const response = await dispatch(getAllMilk({
        monthid: selectedMonth,
        limit: 999999 // Get all records
      }))
      
      if (response.payload && (response.payload as any).data) {
        const allUsersData = (response.payload as any).data
        
        if (allUsersData.length === 0) {
          showMessage('No data found for selected month', 'error')
          return
        }
        
        const month = months.find(m => m._id === selectedMonth)
        
        // Generate the PDF (async to load fonts)
        await generateAllUsersPDF(allUsersData, month)
        showMessage('All users PDF generated successfully!', 'success')
      } else {
        showMessage('No data returned from server', 'error')
      }
    } catch (error) {
      console.error('Error generating all users PDF:', error)
      showMessage('Error generating PDF. Please try again.', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedUser('')
    setSelectedMonth('')
    setStatusMessage('')
    setReportType('single')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-auto max-h-[95vh] overflow-y-auto">
        <CardHeader className="">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-blue-700">
              PDF Report Generator
            </CardTitle>
            <Button 
              onClick={() => {
                onClose()
                resetForm()
              }} 
              variant="outline" 
              size="sm"
              className="rounded-full h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
          <p className="text-gray-600 text-sm">Generate and download PDF reports one at a time</p>
          <p className="text-blue-600 text-xs mt-1">
            {loadingUsers ? 'Loading users...' : `Available: ${allUsers.length} users, ${months.length} months`}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Report Type Selection */}
         

          {/* Month Selection - Always required */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Month *</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className='w-full'>
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

          {/* User Selection - Only for single user reports */}
          {reportType === 'single' && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select User *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                  {loadingUsers ? (
                    <div className="p-2 text-sm text-gray-500">Loading users...</div>
                  ) : allUsers && allUsers.length > 0 ? (
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
              {!loadingUsers && (!allUsers || allUsers.length === 0) && (
                <p className="text-red-500 text-xs">No users found. Please ensure users are loaded.</p>
              )}
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-50 text-green-700' : 
              messageType === 'error' ? 'bg-red-50 text-red-700' : 
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
            onClick={reportType === 'single' ? handleGenerateUserPDF : handleGenerateAllUsersPDF}
            disabled={loadingData || (reportType === 'single' && (!selectedUser || !selectedMonth)) || (reportType === 'all' && !selectedMonth)}
            className={`w-full ${reportType === 'single' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loadingData ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                {reportType === 'single' ? 'Generate User PDF' : 'Generate All Users PDF'}
              </>
            )}
          </Button>
          
          {/* Cancel Button */}
          <Button
            onClick={() => {
              onClose()
              resetForm()
            }}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
