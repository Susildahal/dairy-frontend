import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata } from "../../../store/slices/userSlicer"
import { saveMilk, clearError } from "../../../store/slices/milkSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getsettingdata } from "../../../store/slices/sitesettingSlicer"
import { Milk, Eye, Save, Users, Sun, Moon, User } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'




interface User {
  _id: string
  name: string
  email: string
  phone?: string
  tagnumber?: string
  status: boolean
  both?: boolean
  updatedAt?: string
} 

interface UserMilkEntry {
  userId: string
  name: string
  todaymilk: string
  todayfit: string
  todaymoney: number
  submitted: boolean
}

interface FormValues {
  entries: UserMilkEntry[]
}

// Validation schema for individual milk entry
const milkEntrySchema = Yup.object().shape({
  todaymilk: Yup.number()
    .min(0.1, 'Milk quantity must be at least 0.1 L')
    .max(1000, 'Milk quantity seems too high')
    .required('Milk quantity is required'),
  todayfit: Yup.number()
    .min(0, 'Fat percentage cannot be negative')
    .max(10, 'Fat percentage cannot exceed 10%')
    .required('Fat percentage is required')
  
});

// Main validation schema
const validationSchema = Yup.object().shape({
  entries: Yup.array().of(milkEntrySchema)
});

const Addmilk = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, lastFetched } = useSelector((state: RootState) => state.user)
  const { error: milkError } = useSelector((state: RootState) => state.milk)
  const { data: settingData } = useSelector((state: RootState) => state.siteSettings);
  
  // Check if any user in the system has superadmin role
  const hasSuperAdminUsers = data.some((user: any) => user.role === 'superadmin');

  const rate = settingData?.rate_of_user || 0;
  const superadminrate = settingData?.rate_of_admin || 0;
  
  console.log('Has superadmin users:', hasSuperAdminUsers);
  console.log('Regular rate:', rate, 'Superadmin rate:', superadminrate);
  console.log('Current rate being used:', hasSuperAdminUsers ? superadminrate : rate);


  // Filter state for morning/night
  const [selectedFilter, setSelectedFilter] = useState<'morning' | 'night'>('morning');
  const [submittingUser, setSubmittingUser] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch settings if not already loaded
    if (!settingData) {
      dispatch(getsettingdata());
    }
  }, [dispatch, settingData]);

  useEffect(() => {
    // Only fetch users if data is stale or doesn't exist
    const isDataStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
    
    if ((data.length === 0 || isDataStale) && !loading) {
      dispatch(getdata())
    }
  }, [dispatch, data.length, loading, lastFetched])

  // Handle errors
  useEffect(() => {
    if (milkError) {
      toast.error(milkError);
      dispatch(clearError());
    }
  }, [milkError, dispatch]);

  // Filter users based on morning/night selection
  const getFilteredUsers = () => {
    const activeUsers = data.filter(user => user.status === true);
    
    if (selectedFilter === 'morning') {
      return activeUsers; // Show all active users
    } else {
      return activeUsers.filter(user => user.both === true); // Show only users where both is true
    }
  };

  // Create initial form values based on filtered users
  const createInitialValues = (users: User[]): FormValues => {
    const entries: UserMilkEntry[] = users.map(user => ({
      userId: user._id,
      name: user.name,
      todaymilk: '',
      todayfit: '',
      todaymoney: 0,
      submitted: false
    }));

    return { entries };
  };

  const calculateMoney = (milk: string, fit: string): number => {
    const milkQuantity = parseFloat(milk) || 0;
    const fitPercentage = parseFloat(fit) || 0;
    const currentRate = hasSuperAdminUsers ? Number(superadminrate) : Number(rate);
    // Formula: milk * fat * rate (not divided by 100)
    return milkQuantity * fitPercentage * currentRate;
  };

  // Check if user can be updated (last update more than 1 hour ago)
  const canUpdateUser = (updatedAt: string | undefined): boolean => {
    if (!updatedAt) return true;
    const lastUpdate = new Date(updatedAt).getTime();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return lastUpdate < oneHourAgo;
  };

  const handleSubmitSingle = async (userEntry: UserMilkEntry, setFieldValue: any, index: number) => {
    setSubmittingUser(userEntry.userId);
    
    try {
      if (!userEntry.todaymilk || !userEntry.todayfit) {
        toast.error(`Please enter both milk quantity and fat percentage for ${userEntry.name}`);
        setSubmittingUser(null);
        return;
      }

      const milkQuantity = parseFloat(userEntry.todaymilk);
      const fitQuantity = parseFloat(userEntry.todayfit);

      if (milkQuantity <= 0) {
        toast.error(`Invalid milk quantity for ${userEntry.name}. Must be greater than 0`);
        setSubmittingUser(null);
        return;
      }

      if (fitQuantity < 0 || fitQuantity > 100) {
        toast.error(`Invalid fat percentage for ${userEntry.name}. Must be between 0 and 100`);
        setSubmittingUser(null);
        return;
      }

      const resultAction = await dispatch(saveMilk({
        userid: userEntry.userId,
        name: userEntry.name,
        todaymilk: milkQuantity,
        todaymoney: userEntry.todaymoney,
        todayfit: fitQuantity,
        session: selectedFilter  // Pass the current session type
      }));

      // Check if the action was fulfilled (successful)
      if (saveMilk.fulfilled.match(resultAction)) {
        // Mark as submitted
        setFieldValue(`entries.${index}.submitted`, true);
        setFieldValue(`entries.${index}.todaymilk`, '');
        setFieldValue(`entries.${index}.todayfit`, '');
        setFieldValue(`entries.${index}.todaymoney`, 0);

        toast.success(`Milk entry saved successfully for ${userEntry.name}!`);
      } else {
        // Handle rejected case
        const errorMessage = resultAction.payload as string || 'Unknown error occurred';
        console.error('Save milk failed:', errorMessage);
        
        // Check if it might be a false negative (data saved but error returned)
        if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
          toast.warning(`Network issue detected for ${userEntry.name}. Please verify the entry.`);
        } else {
          toast.error(`Failed to save milk entry for ${userEntry.name}: ${errorMessage}`);
        }
      }
      
    } catch (error: any) {
      console.error('Error saving milk entry:', error);
      const errorMessage = error?.message || error?.toString() || 'Please try again.';
      
      // If it's a network error, suggest checking the data
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        toast.warning(`Network issue for ${userEntry.name}. Please check if the entry was saved and refresh the page.`);
      } else {
        toast.error(`Failed to save milk entry for ${userEntry.name}: ${errorMessage}`);
      }
    } finally {
      setSubmittingUser(null);
    }
  };

  const handleSubmitAll = async (values: FormValues, { setSubmitting, setFieldValue }: any) => {
    setSubmitting(true);
    
    try {
      const pendingEntries = values.entries.filter(entry => 
        entry.todaymilk && entry.todayfit && !entry.submitted
      );

      if (pendingEntries.length === 0) {
        toast.error('No pending entries to submit. Please enter milk data for at least one user');
        setSubmitting(false);
        return;
      }

      // Submit all entries
      let successCount = 0;
      for (let i = 0; i < pendingEntries.length; i++) {
        const entry = pendingEntries[i];
        const originalIndex = values.entries.findIndex(e => e.userId === entry.userId);
        
        try {
          const resultAction = await dispatch(saveMilk({
            userid: entry.userId,
            name: entry.name,
            todaymilk: parseFloat(entry.todaymilk),
            todaymoney: entry.todaymoney,
            todayfit: parseFloat(entry.todayfit),
            session: selectedFilter  // Pass the current session type
          }));

          // Check if the action was fulfilled (successful)
          if (saveMilk.fulfilled.match(resultAction)) {
            // Mark as submitted
            setFieldValue(`entries.${originalIndex}.submitted`, true);
            setFieldValue(`entries.${originalIndex}.todaymilk`, '');
            setFieldValue(`entries.${originalIndex}.todayfit`, '');
            setFieldValue(`entries.${originalIndex}.todaymoney`, 0);
            
            successCount++;
          } else {
            const errorMessage = resultAction.payload as string || 'Unknown error occurred';
            console.error(`Save milk failed for ${entry.name}:`, errorMessage);
            toast.error(`Failed to save entry for ${entry.name}: ${errorMessage}`);
          }
        } catch (error: any) {
          const errorMessage = error?.message || error?.toString() || 'Unknown error';
          console.error(`Error saving milk entry for ${entry.name}:`, errorMessage);
          toast.error(`Failed to save entry for ${entry.name}: ${errorMessage}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully saved ${successCount} milk entries!`);
      } else if (pendingEntries.length > 0) {
        toast.warning('No entries were saved successfully. Please check your connection and try again.');
      }

    } catch (error) {
      console.error('Error saving milk entries:', error);
      toast.error('Failed to save some milk entries. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const filteredUsers = getFilteredUsers();
  const initialValues = createInitialValues(filteredUsers as User[]);

  return (
    <>
      <AdminHeader 
        title="Add Milk Entry" 
        subtitle="Record daily milk collection from all farmers" 
        linkname="View Users" 
        linkto="/admin/users"
      />
      
      <div className="space-y-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitAll}
          enableReinitialize={true}
          key={selectedFilter} // Reset form when filter changes
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => {
            // Calculate total milk dynamically from current form values
            const totalMilk = values.entries.reduce((sum, entry) => {
              return sum + (parseFloat(entry.todaymilk || '0') || 0);
            }, 0);

            return (
              <div className="space-y-6">
                {/* Total Milk Display - Only when superadmin users exist */}
              

            <Form className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                <Button 
                  type="submit"
                  disabled={isSubmitting || values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-3 sm:px-4"
                  size="sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving All Entries...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit All ({values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length} entries)
                    </>
                  )}
                </Button>
                

                
                <Button 
                  type="button"
                  onClick={() => {
                    // Clear all data
                    values.entries.forEach((_, index) => {
                      setFieldValue(`entries.${index}.todaymilk`, '');
                      setFieldValue(`entries.${index}.todayfit`, '');
                      setFieldValue(`entries.${index}.todaymoney`, 0);
                      setFieldValue(`entries.${index}.submitted`, false);
                    });
                    toast.success('All data cleared');
                  }}
                  variant="outline"
                  disabled={isSubmitting}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Clear All Data
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
                  Morning (All Users)
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

                <Button  variant='outline'>
                   {totalMilk.toFixed(1)} L
                </Button>
              </div>

              {/* Users Milk Entry Form Table */}
              <div className="bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                <div className="p-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Milk Collection Form - {selectedFilter === 'morning' ? 'Morning' : 'Night'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter milk data for all users and submit together
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="">
                        <TableHead className="font-semibold w-12">#</TableHead>
                        <TableHead className="font-semibold min-w-32">Name</TableHead>
                        <TableHead className="font-semibold min-w-24 hidden md:table-cell">Tag Number</TableHead>
                        <TableHead className="font-semibold min-w-32">Milk Quantity (L)</TableHead>
                        <TableHead className="font-semibold min-w-32">Fat Percentage (%)</TableHead>
                        <TableHead className="font-semibold min-w-32">Total Money (₹)</TableHead>
                        <TableHead className="font-semibold min-w-32">Status</TableHead>
                        <TableHead className="font-semibold min-w-32 hidden md:table-cell">Last update</TableHead>
                        <TableHead className="font-semibold min-w-32">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Eye className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-500 font-medium">
                                  {selectedFilter === 'morning' 
                                    ? 'No active users found' 
                                    : 'No users with night collection enabled'
                                  }
                                </p>
                                <p className="text-sm text-gray-400">
                                  {selectedFilter === 'morning' 
                                    ? 'Activate users to start recording milk entries'
                                    : 'Enable "both" collection for users to show in night collection'
                                  }
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <FieldArray name="entries">
                          {() => (
                            values.entries.map((entry, index) => {
                              const user = filteredUsers[index];
                              if (!user) return null;
                              
                              const isSubmittingThis = submittingUser === user._id;
                              const hasData = entry.todaymilk && entry.todayfit;
                              const fieldError = errors.entries?.[index] as any;
                              const fieldTouched = touched.entries?.[index] as any;
                              const canUpdate = canUpdateUser(user.updatedAt);

                              return (
                                <React.Fragment key={user._id}>
                                  <TableRow className="hover:bg-gray-50">
                                    <TableCell className="font-medium py-4">{index + 1}</TableCell>
                                    <TableCell className="font-medium py-4">
                                      <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell  className="py-4 hidden  md:table-cell">
                                      <Badge variant="outline" className="text-xs">
                                        {user.tagnumber || 'N/A'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-4">
                                      {entry.submitted ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                          Submitted
                                        </Badge>
                                      ) : (
                                        <div className="space-y-1">
                                          <Field
                                            as={Input}
                                            name={`entries.${index}.todaymilk`}
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="0.0"
                                            className={`w-full min-w-24 ${
                                              fieldError?.todaymilk && fieldTouched?.todaymilk 
                                                ? 'border-red-500 focus:border-red-500' 
                                                : ''
                                            }`}
                                            disabled={isSubmitting || isSubmittingThis || !canUpdate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                              const value = e.target.value;
                                              setFieldValue(`entries.${index}.todaymilk`, value);
                                              // Auto-calculate money
                                              const money = calculateMoney(value, entry.todayfit);
                                              setFieldValue(`entries.${index}.todaymoney`, money);
                                            }}
                                          />
                                          <ErrorMessage 
                                            name={`entries.${index}.todaymilk`} 
                                            component="div" 
                                            className="text-red-500 text-xs" 
                                          />
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                      {entry.submitted ? (
                                        <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                          Submitted
                                        </Badge>
                                      ) : (
                                        <div className="space-y-1">
                                          <Field
                                            as={Input}
                                            name={`entries.${index}.todayfit`}
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            placeholder="0.0"
                                            className={`w-full min-w-24 ${
                                              fieldError?.todayfit && fieldTouched?.todayfit 
                                                ? 'border-red-500 focus:border-red-500' 
                                                : ''
                                            }`}
                                            disabled={isSubmitting || isSubmittingThis || !canUpdate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                              const value = e.target.value;
                                              setFieldValue(`entries.${index}.todayfit`, value);
                                              // Auto-calculate money
                                              const money = calculateMoney(entry.todaymilk, value);
                                              setFieldValue(`entries.${index}.todaymoney`, money);
                                            }}
                                          />
                                          <ErrorMessage 
                                            name={`entries.${index}.todayfit`} 
                                            component="div" 
                                            className="text-red-500 text-xs" 
                                          />
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="secondary"
                                          className={`${entry.todaymoney > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                          ₹{entry.todaymoney.toFixed(2)}
                                        </Badge>
                                        {entry.todaymilk && entry.todayfit && (
                                          <span className="text-xs text-gray-500 hidden sm:inline">
                                            ({parseFloat(entry.todaymilk || '0').toFixed(1)} L * {parseFloat(entry.todayfit || '0').toFixed(1)} * ₹{hasSuperAdminUsers ? superadminrate : rate})
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-4 ">
                                      {entry.submitted ? (
                                        <Badge variant="default" className="bg-green-600 text-white">
                                          Submitted
                                        </Badge>
                                      ) : !canUpdate ? (
                                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                                          Wait 1h
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
                                    <TableCell className=' hidden md:table-cell'>
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
                                      {entry.submitted ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200 block text-center">
                                          ✓ Submitted
                                        </Badge>
                                      ) : !canUpdate ? (
                                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                                          Wait 1h
                                        </Badge>
                                      ) : (
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => handleSubmitSingle(entry, setFieldValue, index)}
                                          disabled={!hasData || isSubmitting || isSubmittingThis}
                                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 w-full sm:w-auto"
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
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              );
                            })
                          )}
                        </FieldArray>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Submit Button at the bottom */}
              <div className="flex justify-center">
                <Button 
                  type="submit"
                  disabled={isSubmitting || values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length === 0}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving All Entries...
                    </>
                  ) : (
                    <>
                      <Milk className="w-5 h-5 mr-2" />
                      Submit All Milk Entries ({values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length} users)
                    </>
                  )}
                </Button>
              </div>
            </Form>
              </div>
            );
          }}
        </Formik>
      </div>
    </>
  )
}

export default Addmilk