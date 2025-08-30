import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata } from "../../../store/slices/userSlicer"
import { saveMilk, clearError, getDailyUserHistory } from "../../../store/slices/milkSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getsettingdata } from "../../../store/slices/sitesettingSlicer"
import { Milk, Eye, Calculator, Save, Users, History, ChevronDown, ChevronUp } from "lucide-react"
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

interface UserMilkData {
  todaymilk: string
  todayfit: string
  todaymoney: number
  submitted: boolean
  submittedData?: {
    milk: number
    fat: number
    money: number
    submittedAt: string
  }
}

const Addmilk = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.user)
  const { saveLoading, error: milkError, userHistory } = useSelector((state: RootState) => state.milk)
  const { data: settingData } = useSelector((state: RootState) => state.siteSettings);
  
  const rate = settingData?.rate_of_user || 0;
  
  // State to store milk data for all users
  const [allUsersMilkData, setAllUsersMilkData] = useState<{ [userId: string]: UserMilkData }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submittingUser, setSubmittingUser] = useState<string | null>(null)
  const [showPreviousData, setShowPreviousData] = useState<{ [userId: string]: boolean }>({})

  useEffect(() => {
    dispatch(getsettingdata());
    // Fetch user history to show previous data
    dispatch(getDailyUserHistory());
  }, [dispatch]);

  useEffect(() => {
    if(data.length === 0){
      dispatch(getdata())
    }
  }, [dispatch])

  // Initialize milk data for all active users
  useEffect(() => {
    const activeUsers = data.filter(user => user.status === true);
    const initialData: { [userId: string]: UserMilkData } = {};
    
    activeUsers.forEach(user => {
      if (!allUsersMilkData[user._id]) {
        initialData[user._id] = {
          todaymilk: '',
          todayfit: '',
          todaymoney: 0,
          submitted: false
        };
      }
    });
    
    if (Object.keys(initialData).length > 0) {
      setAllUsersMilkData(prev => ({ ...prev, ...initialData }));
    }
  }, [data]);

  // Handle errors
  useEffect(() => {
    if (milkError) {
      toast.error(milkError);
      dispatch(clearError());
    }
  }, [milkError, dispatch]);

  const handleInputChange = (userId: string, field: keyof UserMilkData, value: string) => {
    setAllUsersMilkData(prev => {
      const updatedData = {
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: value
        }
      };

      // Calculate money automatically when milk quantity changes
      if (field === 'todaymilk') {
        const milkQuantity = parseFloat(value) || 0;
        const rateValue = Number(rate) || 0;
        const calculatedMoney = milkQuantity * rateValue;
        updatedData[userId].todaymoney = calculatedMoney;
      }

      return updatedData;
    });
  };

  const handleSubmitSingle = async (userId: string, userName: string) => {
    setSubmittingUser(userId);
    
    try {
      const userData = allUsersMilkData[userId];
      
      if (!userData || !userData.todaymilk || !userData.todayfit) {
        toast.error(`Please enter both milk quantity and fat percentage for ${userName}`);
        setSubmittingUser(null);
        return;
      }

      const milkQuantity = parseFloat(userData.todaymilk);
      const fitQuantity = parseFloat(userData.todayfit);

      if (milkQuantity <= 0) {
        toast.error(`Invalid milk quantity for ${userName}. Must be greater than 0`);
        setSubmittingUser(null);
        return;
      }

      if (fitQuantity < 0 || fitQuantity > 100) {
        toast.error(`Invalid fat percentage for ${userName}. Must be between 0 and 100`);
        setSubmittingUser(null);
        return;
      }

      await dispatch(saveMilk({
        userid: userId,
        name: userName,
        todaymilk: milkQuantity,
        todaymoney: userData.todaymoney,
        todayfit: fitQuantity
      })).unwrap();

      // Mark as submitted and store the submitted data
      setAllUsersMilkData(prev => ({
        ...prev,
        [userId]: {
          todaymilk: '',
          todayfit: '',
          todaymoney: 0,
          submitted: true,
          submittedData: {
            milk: milkQuantity,
            fat: fitQuantity,
            money: userData.todaymoney,
            submittedAt: new Date().toLocaleString()
          }
        }
      }));

      toast.success(`Milk entry saved successfully for ${userName}!`);
      
    } catch (error) {
      console.error('Error saving milk entry:', error);
      toast.error(`Failed to save milk entry for ${userName}. Please try again.`);
    } finally {
      setSubmittingUser(null);
    }
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    
    try {
      const activeUsers = data.filter(user => user.status === true);
      const usersWithData = activeUsers.filter(user => {
        const userData = allUsersMilkData[user._id];
        return userData && userData.todaymilk && userData.todayfit && !userData.submitted;
      });

      if (usersWithData.length === 0) {
        toast.error('No pending entries to submit. Please enter milk data for at least one user');
        setSubmitting(false);
        return;
      }

      // Validate all entries
      for (const user of usersWithData) {
        const userData = allUsersMilkData[user._id];
        const milkQuantity = parseFloat(userData.todaymilk);
        const fitQuantity = parseFloat(userData.todayfit);

        if (milkQuantity <= 0) {
          toast.error(`Invalid milk quantity for ${user.name}. Must be greater than 0`);
          setSubmitting(false);
          return;
        }

        if (fitQuantity < 0 || fitQuantity > 100) {
          toast.error(`Invalid fat percentage for ${user.name}. Must be between 0 and 100`);
          setSubmitting(false);
          return;
        }
      }

      // Submit all entries one by one to prevent backend overload
      for (const user of usersWithData) {
        const userData = allUsersMilkData[user._id];
        
        try {
          await dispatch(saveMilk({
            userid: user._id,
            name: user.name,
            todaymilk: parseFloat(userData.todaymilk),
            todaymoney: userData.todaymoney,
            todayfit: parseFloat(userData.todayfit)
          })).unwrap();

          // Mark as submitted after successful submission
          setAllUsersMilkData(prev => ({
            ...prev,
            [user._id]: {
              ...prev[user._id],
              submitted: true
            }
          }));

        } catch (error) {
          console.error(`Error saving milk entry for ${user.name}:`, error);
          toast.error(`Failed to save entry for ${user.name}`);
          break; // Stop processing if one fails
        }
      }

      toast.success(`Milk entries processed for ${usersWithData.length} users!`);

    } catch (error) {
      console.error('Error saving milk entries:', error);
      toast.error('Failed to save some milk entries. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearAllData = () => {
    const activeUsers = data.filter(user => user.status === true);
    const clearedData: { [userId: string]: UserMilkData } = {};
    
    activeUsers.forEach(user => {
      clearedData[user._id] = {
        todaymilk: '',
        todayfit: '',
        todaymoney: 0,
        submitted: false
      };
    });
    
    setAllUsersMilkData(clearedData);
    toast.success('All data cleared');
  };

  const getTotalMilk = () => {
    return Object.values(allUsersMilkData).reduce((total, userData) => {
      return total + (parseFloat(userData.todaymilk) || 0);
    }, 0);
  };

  const getTotalMoney = () => {
    return Object.values(allUsersMilkData).reduce((total, userData) => {
      return total + userData.todaymoney;
    }, 0);
  };

  const getEntriesCount = () => {
    return Object.values(allUsersMilkData).filter(userData => userData.todaymilk && userData.todayfit && !userData.submitted).length;
  };

  const getSubmittedCount = () => {
    return Object.values(allUsersMilkData).filter(userData => userData.submitted).length;
  };

  const getUserPreviousData = (userId: string) => {
    // Find the latest entry for this user from userHistory
    const userEntries = userHistory.filter(entry => entry.userid === userId);
    if (userEntries.length > 0) {
      // Sort by date and get the most recent
      const sortedEntries = userEntries.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      return sortedEntries[0];
    }
    return null;
  };

  const togglePreviousData = (userId: string) => {
    setShowPreviousData(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (loading) {
    return <Loading />;
  }

  // Filter only active users
  const activeUsers = data.filter(user => user.status === true);

  return (
    <>
      <AdminHeader 
        title="Add Milk Entry" 
        subtitle="Record daily milk collection from all farmers" 
        linkname="View Users" 
        linkto="/admin/users"
      />
      
      <div className="space-y-6">
     

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleSubmitAll}
            disabled={submitting || getEntriesCount() === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving All Entries...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit All ({getEntriesCount()} entries)
              </>
            )}
          </Button>
          
          <Button 
            onClick={clearAllData}
            variant="outline"
            disabled={submitting}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Clear All Data
          </Button>
        </div>

        {/* Users Milk Entry Form Table */}
        <div className="bg-white dark:bg-gray-800  dark:border-gray-700 overflow-hidden">
          <div className="p-4  dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Milk Collection Form
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter milk data for all users and submit together
            </p>
          </div>
          
          <div className="">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="font-semibold w-12">#</TableHead>
                  <TableHead className="font-semibold min-w-32">Name</TableHead>
                  <TableHead className="font-semibold min-w-24">Tag Number</TableHead>
                  <TableHead className="font-semibold min-w-32">Milk Quantity (L)</TableHead>
                  <TableHead className="font-semibold min-w-32">Fat Percentage (%)</TableHead>
                  <TableHead className="font-semibold min-w-32">Total Money (₹)</TableHead>
                  <TableHead className="font-semibold min-w-32">Status</TableHead>
                  <TableHead className="font-semibold min-w-32">Last update</TableHead>
                  <TableHead className="font-semibold min-w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
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
                  activeUsers.map((user, index) => {
                    const userData = allUsersMilkData[user._id] || { todaymilk: '', todayfit: '', todaymoney: 0, submitted: false };
                    const isSubmittingThis = submittingUser === user._id;
                    const hasData = userData.todaymilk && userData.todayfit;

                    
                    return (
                      <React.Fragment key={user._id || index}>
                        <TableRow className=" hover:bg-gray-50 ">
                          <TableCell className="font-medium py-4">{index + 1}</TableCell>
                          <TableCell className="font-medium py-4">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-xs">
                              {user.tagnumber || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            {userData.submitted && userData.submittedData ? (
                              <div className="space-y-1">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {userData.submittedData.milk.toFixed(1)} L
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  Submitted: {userData.submittedData.submittedAt}
                                </div>
                              </div>
                            ) : (
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                value={userData.todaymilk}
                                onChange={(e) => handleInputChange(user._id, 'todaymilk', e.target.value)}
                                className="w-full min-w-24"
                                disabled={submitting || isSubmittingThis || userData.submitted}
                              />
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {userData.submitted && userData.submittedData ? (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                {userData.submittedData.fat.toFixed(1)}%
                              </Badge>
                            ) : (
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0.0"
                                value={userData.todayfit}
                                onChange={(e) => handleInputChange(user._id, 'todayfit', e.target.value)}
                                className="w-full min-w-24"
                                disabled={submitting || isSubmittingThis || userData.submitted}
                              />
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {userData.submitted && userData.submittedData ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ₹{userData.submittedData.money.toFixed(2)}
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={`${userData.todaymoney > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  ₹{userData.todaymoney.toFixed(2)}
                                </Badge>
                                {userData.todaymilk && (
                                  <span className="text-xs text-gray-500">
                                    ({userData.todaymilk} × {rate} )
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {userData.submitted ? (
                              <Badge variant="default" className="bg-green-600 text-white">
                                Submitted
                              </Badge>
                            ) : hasData ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                         <TableCell>
                           {(() => {
                                  if (!user.updatedAt) {
                                  return <div className="text-xs text-gray-500">No updates</div>;
                                  }
                                  const updatedTime = new Date(user.updatedAt).getTime();
                                  if (isNaN(updatedTime)) {
                                  return <div className="text-xs text-gray-500">Invalid date</div>;
                                  }
                                  const diffMs = Date.now() - updatedTime;
                                  if (diffMs < 60_000) {
                                  return <div className="text-xs text-gray-500">just now</div>;
                                  }
                                  const minutes = Math.floor(diffMs / 60_000);
                                  if (minutes < 60) {
                                  return (
                                    <div className="text-xs text-gray-500">
                                    {minutes} minute{minutes > 1 ? 's' : ''} ago
                                    </div>
                                  );
                                  }
                                  const hours = Math.floor(minutes / 60);
                                  if (hours < 24) {
                                  return (
                                    <div className="text-xs text-gray-500">
                                    {hours} hour{hours > 1 ? 's' : ''} ago
                                    </div>
                                  );
                                  }
                                  const days = Math.floor(hours / 24);
                                  return (
                                  <div className="text-xs text-gray-500">
                                    {days} day{days > 1 ? 's' : ''} ago
                                  </div>
                                  );
                                })()}
                         </TableCell>
                          <TableCell className="py-4">
                            {userData.submitted ? (
                              <Badge variant="outline" className="text-green-600 border-green-200 block text-center">
                                ✓ Submitted
                              </Badge>
                            ) : (
                                <div className="flex flex-col items-start gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitSingle(user._id, user.name)}
                                  disabled={!hasData || submitting || isSubmittingThis}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                                >
                                  {isSubmittingThis ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Saving...
                                  </>
                                  ) : (
                                  <>
                                    <Save className="w-3 h-3 mr-1" />
                                    Submit
                                  </>
                                  )}
                                </Button>

                              
                                </div>
                            )}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Submit Button at the bottom */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmitAll}
            disabled={submitting || getEntriesCount() === 0}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving All Entries...
              </>
            ) : (
              <>
                <Milk className="w-5 h-5 mr-2" />
                Submit All Milk Entries ({getEntriesCount()} users)
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}

export default Addmilk