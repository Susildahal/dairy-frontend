import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata, deleteuser, updatestatus, clearError  ,updatebothstatus  } from "../../../store/slices/userSlicer"
import { shouldFetchUserData } from '../../../utils/cacheHelper'
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Eye, Edit, AlertTriangle } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const UsersDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data = [], loading, deleteLoading, statusloading, error, lastFetched } = useSelector((state: RootState) => state.user)
  const navigate = useNavigate();
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, userId: null, userName: '' });

  useEffect(() => {
    // Use cache helper to determine if we should fetch
    if (shouldFetchUserData(data, lastFetched, loading)) {
      dispatch(getdata())
    }
  }, [dispatch, data.length, loading, lastFetched])

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDeleteUser = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, userId: id, userName: name });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.userId) return;
    
    try {
      await dispatch(deleteuser(deleteDialog.userId)).unwrap();
      toast.success(`User "${deleteDialog.userName}" deleted successfully!`);
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
    } catch (error) {
      console.error('Error deleting user:', error);
      // Error is already handled by the useEffect above
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  const handleStatusUpdate = async (id: string, currentStatus: boolean, userName: string) => {
    try {
      const newStatus = !currentStatus;
      await dispatch(updatestatus({ id, status: newStatus })).unwrap();
      toast.success(`User "${userName}" status updated to ${newStatus ? 'Active' : 'Inactive'}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      // Error is already handled by the useEffect above
    }
  };

   const handleBothUpdate = async (id: string, currentBoth: boolean, userName: string) => {
    try {
      const newBoth = !currentBoth;
      await dispatch(updatebothstatus({ id, both: newBoth })).unwrap();
      toast.success(`User "${userName}" both status updated to ${newBoth ? 'Active' : 'Inactive'}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      // Error is already handled by the useEffect above
    }
  };

  if (loading) {
    return <Loading />
  }
  return (
  <div className="space-y-4 w-full   mx-auto ">

      <AdminHeader 
        title="User Management" 
        subtitle="Manage and monitor all system users" 
        linkname="Create User" 
        linkto="/admin/users/create" 
      />
      
      <div className="bg-white dark:bg-gray-800  dark:border-gray-700">
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Users
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.length} user(s) total
              </p>
            </div>
          </div>
          
     <div className=" overflow-x-hidden ">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Tag Number</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Is both available</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Eye className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">No users found</p>
                          <p className="text-sm text-gray-400">
                            Create your first user to get started
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (data as any[]).map((user: any, index: number) => (
                    <TableRow key={user._id || index} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium py-4">{index + 1}</TableCell>
                      <TableCell className="font-medium py-4">{user.name}</TableCell>
                      <TableCell className="py-4">{user.email}</TableCell>
                      <TableCell className="py-4">{user.phone || '-'}</TableCell>
                      <TableCell className="py-4">{user.tagnumber || '-'}</TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!user.status}
                            onCheckedChange={() => user._id && handleStatusUpdate(user._id, !!user.status, user.name ?? '')}
                            disabled={statusloading}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Badge 
                            variant={user.status ? 'default' : 'secondary'}
                            className={user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.status ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>

                       <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!user.both}
                            onCheckedChange={() => user._id && handleBothUpdate(user._id, !!user.both, user.name ?? '')}
                            disabled={statusloading}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Badge 
                            variant={user.both ? 'default' : 'secondary'}
                            className={user.both ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.both  ? 'छ' : 'छैन'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => user._id && handleDeleteUser(user._id, user.name ?? '')}
                            disabled={deleteLoading}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                           <Button
                            size="sm"
                            variant="outline"
                            onClick={() => user._id ? navigate(`/admin/users/edit/${user._id}`) : undefined}
                            disabled={deleteLoading}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to delete user <span className="font-semibold text-gray-900 dark:text-gray-100">"{deleteDialog.userName}"</span>?
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersDetails
