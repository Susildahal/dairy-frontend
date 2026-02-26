import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { getdata } from '@/store/slices/userSlicer'
import { getAllMilk } from '@/store/slices/milkSlicer'
import { getActiveMonth, getAllMonths } from '@/store/slices/monthslicer'
import { getsettingdata } from '@/store/slices/sitesettingSlicer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Milk, DollarSign, TrendingUp, Calendar, Settings, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPDFModal } from './components/AdminPDFModal'

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: users, loading: usersLoading } = useSelector((state: RootState) => state.user)
  const { adminTotals, loading: milkLoading } = useSelector((state: RootState) => state.milk)
  const { activeMonth } = useSelector((state: RootState) => state.months)
  const { months } = useSelector((state: RootState) => state.months)
  const { data: siteSettings } = useSelector((state: RootState) => state.siteSettings)
  const [showPDFModal, setShowPDFModal] = useState(false)

  useEffect(() => {
    dispatch(getdata())
    dispatch(getAllMilk({}))
    dispatch(getActiveMonth())
    dispatch(getAllMonths())
    dispatch(getsettingdata())

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [dispatch])

  // Calculate statistics
  const activeUsers = users.filter(user => user.status && user.role !== 'admin').length
  const totalUsers = users.filter(user => user.role !== 'admin').length
  const adminCount = users.filter(user => user.role === 'admin').length

  const currentMonthTotal = adminTotals.length > 0 ? adminTotals[0] : null
  const totalMilk = currentMonthTotal?.totalMilk || 0
  const totalRevenue = currentMonthTotal?.totalMoney || 0

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Welcome back! Here's what's happening with your dairy farm today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Active Month Banner */}
        {activeMonth && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 border-none ">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Active Month</p>
                    <p className="text-2xl font-bold">
                      {activeMonth.month} {activeMonth.year}
                    </p>
                  </div>
                </div>
                <Badge className="bg-white text-blue-600 hover:bg-white">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Users Card */}
          <Card className=" duration-300 border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {usersLoading ? '...' : totalUsers}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeUsers} active • {totalUsers - activeUsers} inactive
              </p>
              <Link to="/admin/users" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block">
                View all users →
              </Link>
            </CardContent>
          </Card>

          {/* Total Milk Card */}
          <Card className=" duration-300 border-t-4 border-t-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Milk (This Month)
              </CardTitle>
              <Milk className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {milkLoading ? '...' : totalMilk.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Liters collected
              </p>
              <Link to="/admin/milk-management" className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mt-2 inline-block">
                View milk records →
              </Link>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="  duration-300 border-t-4 border-t-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{milkLoading ? '...' : totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current month earnings
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  {activeMonth ? `${activeMonth.month}` : 'No active month'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Count Card */}
          <Card className=" duration-300 border-t-4 border-t-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Administrators
              </CardTitle>
              <Settings className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {usersLoading ? '...' : adminCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                System administrators
              </p>
              <Link to="/admin/settings" className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mt-2 inline-block">
                Manage settings →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions Card */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                to="/admin/add-milk" 
                className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Milk className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Add Milk Entry</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Record new milk collection</p>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link 
                to="/admin/create-user" 
                className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Create New User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add a new user to system</p>
                  </div>
                </div>
                <span className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link 
                to="/admin/month-management" 
                className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Manage Months</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Create and activate months</p>
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <button
                onClick={() => setShowPDFModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Generate PDF Report</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Download monthly milk reports</p>
                  </div>
                </div>
                <span className="text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-xl">System Information</CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {siteSettings ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Farm Name</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.name || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact Email</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.email || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact Phone</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.phone || 'Not Set'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">User Rate</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{siteSettings.rate_of_user || '0'}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Admin Rate</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{siteSettings.rate_of_admin || '0'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No system settings configured</p>
                  <Link to="/admin/settings" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-2 inline-block">
                    Configure now →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="mt-6 ">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity Overview</CardTitle>
            <CardDescription>Latest updates and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Users</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{activeUsers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Currently collecting milk</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg. Milk/User</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {activeUsers > 0 ? (totalMilk / activeUsers).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Liters per user</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">System Status</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Online</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin PDF Modal */}
      <AdminPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        months={months || []}
      />
    </div>
  )
}
