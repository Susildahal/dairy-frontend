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
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import * as Yup from 'yup'

// Types
interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  status: boolean;
  tagnumber: string;
  both: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: boolean;
  tagnumber: string;
  both: boolean;
}

const Createuser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { createLoading, updateLoading, data, error } = useSelector((state: RootState) => state.user);
  const { id } = useParams<{ id?: string }>();
  
  // Determine if we're editing or creating
  const isEditMode = Boolean(id);
  const isLoading = createLoading || updateLoading;

  const [showPassword, setShowPassword] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<UserFormValues>({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    status: true,
    tagnumber: '',
    both: 'true'
  });

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Full name is required'),
    
    email: Yup.string()
      .email('Invalid email address')
      .required('Email address is required'),
    
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),
    
    role: Yup.string()
      .oneOf(['admin', 'user' ,'superadmin'], 'Please select a valid role')
      .required('Role is required'),
    
    password: isEditMode 
      ? Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .optional()
      : Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
    
    tagnumber: Yup.string()
      .required('Tag number is required'),
    
    both: Yup.string()
      .oneOf(['true', 'false'], 'Please select a valid type')
      .required('Type is required')
  });

  // Load user data if editing
  useEffect(() => {
    if (isEditMode && id) {
      setInitialLoading(true);
      
      // Safely get users array from state
      const users = Array.isArray(data) ? data : [];
      // First check if user exists in current state
      const existingUser = users.find((user: User) => user._id === id);
      
      if (existingUser) {
        // User found in state, populate form
        const userValues: UserFormValues = {
          name: existingUser.name || '',
          email: existingUser.email || '',
          phone: existingUser.phone || '',
          role: existingUser.role || '',
          password: '', // Don't populate password for security
          status: existingUser.status !== undefined ? existingUser.status : true,
          tagnumber: existingUser.tagnumber || '',
          both: existingUser.both !== undefined ? String(existingUser.both) : 'true'
        };
        setInitialValues(userValues);
        setInitialLoading(false);
      } else {
        // User not in state, fetch from API
        dispatch(getbyid(id!))
          .unwrap()
          .then((userData: User) => {
            const userValues: UserFormValues = {
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || '',
              password: '', // Don't populate password for security
              status: userData.status !== undefined ? userData.status : true,
              tagnumber: userData.tagnumber || '',
              both: userData.both !== undefined ? String(userData.both) : 'true'
            };
            setInitialValues(userValues);
          })
          .catch((error: any) => {
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

  const handleSubmit = async (
    values: UserFormValues, 
    { setSubmitting, resetForm }: FormikHelpers<UserFormValues>
  ) => {
    try {
      if (isEditMode && id) {
        // Update existing user
        const updateData: any = { ...values };
        
        // Convert 'both' string to boolean for API
        updateData.both = updateData.both === 'true';
        
        // If password is empty string, don't include it in update
        if (!updateData.password?.trim()) {
          delete updateData.password;
        }
        
        // Prepare payload: { id, userData } to match the thunk signature
        const payload = { id: id!, userData: updateData };

        console.log('Updating user with ID:', id);
        console.log('Update payload:', payload);
        await dispatch(updateUser(payload)).unwrap();
        toast.success('User updated successfully!');
      } else {
        // Create new user
        const createPayload = { 
          ...values, 
          both: values.both === 'true' 
        };
        await dispatch(register(createPayload)).unwrap();
        toast.success('User created successfully!');
        
        // Reset form after successful creation
        resetForm();
      }

      // Navigate to users list after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 1000);

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
      // Error is already handled by the useEffect above
    } finally {
      setSubmitting(false);
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
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* First Row - Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter full name"
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.name && touched.name ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.email && touched.email ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.phone && touched.phone ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2 w-full">
                      <Label htmlFor="role" className="text-sm font-medium">
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={values.role} 
                        onValueChange={(value) => setFieldValue('role', value)}
                      >
                        <SelectTrigger className={`bg-gray-50 dark:bg-gray-800 w-full border-gray-200 dark:border-gray-700 ${
                          errors.role && touched.role ? 'border-red-500 focus:border-red-500' : ''
                        }`}>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="both" className="text-sm font-medium">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={values.both} 
                      onValueChange={(value) => setFieldValue('both', value)}
                    >
                      <SelectTrigger className={`bg-gray-50 dark:bg-gray-800 w-full border-gray-200 dark:border-gray-700 ${
                        errors.both && touched.both ? 'border-red-500 focus:border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">छ</SelectItem>
                        <SelectItem value="false">छैन</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage name="both" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Second Row - Tag Number and Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Tag Number Field */}
                    <div className="space-y-2">
                      <Label htmlFor="tagnumber" className="text-sm font-medium">
                        Tag Number <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="tagnumber"
                        name="tagnumber"
                        type="text"
                        placeholder="Enter tag number"
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.tagnumber && touched.tagnumber ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="tagnumber" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password {!isEditMode && <span className="text-red-500">*</span>}
                        {isEditMode && <span className="text-sm text-gray-500 font-normal">(leave blank to keep current)</span>}
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                          className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-10 ${
                            errors.password && touched.password ? 'border-red-500 focus:border-red-500' : ''
                          }`}
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
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 h-11"
                    >
                      {(isLoading || isSubmitting) ? (
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
                        disabled={isLoading || isSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Createuser