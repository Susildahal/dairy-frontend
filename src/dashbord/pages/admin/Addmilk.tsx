import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata } from "../../../store/slices/userSlicer"
import { saveMilk, clearError } from "../../../store/slices/milkSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getsettingdata } from "../../../store/slices/sitesettingSlicer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Milk, Eye, Calculator } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  tagnumber: string
  status: boolean
}

const Addmilk = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.user)
  const { saveLoading, error: milkError } = useSelector((state: RootState) => state.milk)
  const { data: settingData } = useSelector((state: RootState) => state.siteSettings);
  
  const rate = settingData?.rate_of_user || 0;
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [milkData, setMilkData] = useState({
    todaymilk: '',
    todayfit: '',
    todaymoney: 0
  })

  useEffect(() => {
    dispatch(getsettingdata());
  }, [dispatch]);

  useEffect(() => {
    if(data.length === 0){
      dispatch(getdata())
    }
  }, [dispatch])

  // Handle errors
  useEffect(() => {
    if (milkError) {
      toast.error(milkError);
      dispatch(clearError());
    }
  }, [milkError, dispatch]);

  // Calculate money in real-time when milk quantity changes
  useEffect(() => {
    const milkQuantity = parseFloat(milkData.todaymilk) || 0;
    const rateValue = Number(rate) || 0;
    const calculatedMoney = milkQuantity * rateValue;
    setMilkData(prev => ({
      ...prev,
      todaymoney: calculatedMoney
    }));
  }, [milkData.todaymilk, rate]);

  const handleAddMilk = (user: User) => {
    setSelectedUser(user)
    setMilkData({
      todaymilk: '',
      todayfit: '',
      todaymoney: 0
    })
    setDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMilkData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) return;

    if (!milkData.todaymilk || !milkData.todayfit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const milkQuantity = parseFloat(milkData.todaymilk);
    const fitQuantity = parseFloat(milkData.todayfit);

    if (milkQuantity <= 0) {
      toast.error('Milk quantity must be greater than 0');
      return;
    }

    if (fitQuantity < 0 || fitQuantity > 100) {
      toast.error('Fat percentage must be between 0 and 100');
      return;
    }

    try {
      await dispatch(saveMilk({
        userid: selectedUser._id,
        name: selectedUser.name,
        todaymilk: milkQuantity,
        todaymoney: milkData.todaymoney,
        todayfit: fitQuantity
      })).unwrap();

      toast.success(`Milk entry saved successfully for ${selectedUser.name}!`);
      setDialogOpen(false);
      setSelectedUser(null);
      setMilkData({
        todaymilk: '',
        todayfit: '',
        todaymoney: 0
      });
    } catch (error) {
      console.error('Error saving milk entry:', error);
      // Error is handled by the useEffect above
    }
  }

  if (loading) {
    return <Loading />;
  }

  // Filter only active users
  const activeUsers = data.filter(user => user.status === true);

  return (
    <>
      <AdminHeader 
        title="Add Milk Entry" 
        subtitle="Record daily milk collection from farmers" 
        linkname="View Users" 
        linkto="/admin/users"
      />
      
      <div className="space-y-6">
        {/* Rate Information */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Current Rate</h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                ₹{rate} per liter - Money will be calculated automatically
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Tag Number</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Eye className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 font-medium">No active users found</p>
                        <p className="text-sm text-gray-400">
                          Activate users to start recording milk entries
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                activeUsers.map((user, index) => (
                  <TableRow key={user._id || index} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium py-4">{index + 1}</TableCell>
                    <TableCell className="font-medium py-4">{user.name}</TableCell>
                    <TableCell className="py-4">{user.email}</TableCell>
                    <TableCell className="py-4">{user.phone || '-'}</TableCell>
                    <TableCell className="py-4">{user.tagnumber || '-'}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button 
                        onClick={() => handleAddMilk(user as User)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={saveLoading}
                      >
                        <Milk className="w-4 h-4 mr-2" />
                        Add Milk
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Milk Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Milk className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Add Milk Entry
            </DialogTitle>
            <DialogDescription>
              Record milk collection for <span className="font-semibold text-green-600">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Tag Number:</span>
                  <span className="ml-2 font-medium">{selectedUser?.tagnumber || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rate:</span>
                  <span className="ml-2 font-medium">₹{rate}/L</span>
                </div>
              </div>
            </div>

            {/* Milk Quantity */}
            <div className="space-y-2">
              <Label htmlFor="todaymilk" className="text-sm font-medium">
                Milk Quantity (Liters) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="todaymilk"
                name="todaymilk"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter milk quantity"
                value={milkData.todaymilk}
                onChange={handleInputChange}
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Fat Percentage */}
            <div className="space-y-2">
              <Label htmlFor="todayfit" className="text-sm font-medium">
                Fat Percentage (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="todayfit"
                name="todayfit"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Enter fat percentage"
                value={milkData.todayfit}
                onChange={handleInputChange}
                required
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Calculated Money */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Money (Auto-calculated)</Label>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {milkData.todaymilk ? `${milkData.todaymilk} L × ₹${rate}` : 'Enter milk quantity'}
                  </span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    ₹{milkData.todaymoney.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={saveLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={saveLoading || !milkData.todaymilk || !milkData.todayfit}
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Milk className="w-4 h-4 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Addmilk