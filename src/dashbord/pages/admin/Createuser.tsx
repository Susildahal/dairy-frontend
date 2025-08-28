import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Eye, EyeOff, Save } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { register, getbyid, updateUser, clearError } from "../../../store/slices/userSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import { useParams } from 'react-router-dom'

const Createuser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { createLoading, updateLoading, data, error } = useSelector((state: RootState) => state.user);
  const { id } = useParams<{ id: string }>();
  
  // Determine if we're editing or creating
  const isEditMode = Boolean(id);
  const isLoading = createLoading || updateLoading;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    status: true,
    tagnumber: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false);

  // Load user data if editing
  useEffect(() => {
    if (isEditMode && id) {
      setInitialLoading(true);
      // First check if user exists in current state
      const existingUser = data.find(user => user._id === id);
      
      if (existingUser) {
        // User found in state, populate form
        setFormData({
          id: existingUser._id || '',
          name: existingUser.name || '',
          email: existingUser.email || '',
          phone: existingUser.phone || '',
          role: existingUser.role || '',
          password: '', // Don't populate password for security
          status: existingUser.status || true,
          tagnumber: existingUser.tagnumber || ''
        });
        setInitialLoading(false);
      } else {
        // User not in state, fetch from API
        dispatch(getbyid(id))
          .unwrap()
          .then((userData) => {
            setFormData({
              id: userData._id || '',
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || '',
              password: '', // Don't populate password for security
              status: userData.status || true,
              tagnumber: userData.tagnumber || ''
            });
          })
          .catch((error) => {
            toast.error('Failed to load user data');
            navigate('/admin/users');
          })
          .finally(() => {
            setInitialLoading(false);
          });
      }
    }
  }, [id, isEditMode, dispatch, data, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditMode && id) {
        // Update existing user
        const updateData = { ...formData };
        
        // If password is empty, don't include it in update
        if (!updateData.password.trim()) {
          delete updateData.password;
        }
        
        // Ensure we have the correct ID for the update
        updateData.id = id;
        
        console.log('Updating user with ID:', id);
        console.log('Update data:', updateData);
        
        await dispatch(updateUser({ id, userData: updateData })).unwrap();
        toast.success('User updated successfully!');
      } else {
        // Create new user
        await dispatch(register(formData)).unwrap();
        toast.success('User created successfully!');
        
        // Reset form for create mode only
        setFormData({
          id: '',
          name: '',
          email: '',
          phone: '',
          role: '',
          password: '',
          status: true,
          tagnumber: ''
        });
      }

      // Navigate to users list after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 1000);

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
      // Error is already handled by the useEffect above
    }
  }

  // Show loading screen while fetching user data for edit
  if (isEditMode && initialLoading) {
    return (
      <>
        <AdminHeader 
          title="User Management" 
          subtitle="Loading user data..." 
          linkname="View Users" 
          linkto="/admin/users"
        />
        <div className="mx-auto">
          <Card className="shadow-lg border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader 
        title="User Management" 
        subtitle={isEditMode ? "Edit user information" : "Manage and add new users"} 
        linkname="View Users" 
        linkto="/admin/users"
      />
      <div className="mx-auto">
        <Card className="shadow-lg border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row - Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Role Field */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange} 
                    required
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 w-full border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row - Tag Number and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Tag Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="tagnumber" className="text-sm font-medium">
                    Tag Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tagnumber"
                    name="tagnumber"
                    type="text"
                    placeholder="Enter tag number"
                    value={formData.tagnumber}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password {!isEditMode && <span className="text-red-500">*</span>}
                    {isEditMode && <span className="text-sm text-gray-500 font-normal">(leave blank to keep current)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditMode}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.role}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-11"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating User...' : 'Creating User...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update User
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create User
                        </>
                      )}
                    </>
                  )}
                </Button>
                
                <Link to="/admin/users" className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Createuser