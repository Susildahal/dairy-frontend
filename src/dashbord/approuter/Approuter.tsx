import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loading from "../ui/Loading";
import ProtectedRoute from "../../components/ProtectedRoute";

// Lazy load layouts
const UserLayout = lazy(() => import("../layouts/UserLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// Lazy load components
const Login = lazy(() => import("../ui/Login"));
const NotFound = lazy(() => import("../common/NotFound"));
const User = lazy(() => import("../pages/admin/UsersDetails"));

// Lazy load pages
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const UserHome = lazy(() => import("../pages/user/UserHome"));
const UserDashboard = lazy(() => import("../pages/user/UserDashboard"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const MilkManagement = lazy(() => import("../pages/admin/MilkManagement"));
// Typed lazy import so the Createuser component can accept the `isedit` prop
const Createuser = lazy(() => import("../pages/admin/Createuser")) as unknown as React.ComponentType<{ isedit?: boolean }>;
const Settings = lazy(() => import("../pages/admin/setting"));
const MonthManagement = lazy(() => import("../pages/admin/MonthManagement"));
const Addmilk = lazy(() => import("../pages/admin/Addmilk"));
const Userdaily = lazy(() => import("../pages/admin/Alldetails"));
export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    {/* Public Landing Page - Available for everyone */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* User Routes - Accessible to both users and admins */}
                    <Route path="/user" element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<UserHome />} />
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="products" element={<div>Products Page</div>} />
                        <Route path="about" element={<div>About Page</div>} />
                        <Route path="contact" element={<div>Contact Page</div>} />
                    </Route>

                    {/* Admin Routes - Only accessible to admin users */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="user-dashboard" element={<UserDashboard />} />
                        <Route path="users" element={<User />} />
                        <Route path="milk" element={<Addmilk />} />
                        <Route path="milk-management" element={<MilkManagement />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="users/create" element={<Createuser />} />
                        <Route path="/admin/users/edit/:id" element={<Createuser isedit={true} />} />
                        <Route path="user-reports" element={<Userdaily />} />
                        <Route path="add-month" element={<MonthManagement />} />
                        
                        {/* Admin can also access user dashboard */}
                        <Route path="user-dashboard" element={<UserDashboard />} />
                    </Route>

                    {/* Standalone protected dashboard route for users */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Legacy redirects */}
                    <Route path="/dashbord" element={<Navigate to="/dashboard" replace />} />
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
