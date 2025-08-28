import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loading from "../ui/Loading";

// Lazy load layouts
const UserLayout = lazy(() => import("../layouts/UserLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// Lazy load components
const Login = lazy(() => import("../ui/Login"));
const NotFound = lazy(() => import("../common/NotFound"));
const User = lazy(() => import("../pages/admin/UsersDetails"));

// Lazy load pages
const UserHome = lazy(() => import("../pages/user/UserHome"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
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
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* User Routes */}
                    <Route path="/" element={<UserLayout />}>
                        <Route index element={<UserHome />} />
                        <Route path="products" element={<div>Products Page</div>} />
                        <Route path="about" element={<div>About Page</div>} />
                        <Route path="contact" element={<div>Contact Page</div>} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<User />} />
                        <Route path="/admin/milk" element={<Addmilk />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="users/create" element={<Createuser />} />
                        <Route path="users/create/:id" element={<Createuser isedit={true} />} />
                        <Route path="/admin/user-daily" element={<Userdaily />} />
                        <Route path="add-month" element={<MonthManagement />} />

                    </Route>

                    {/* Legacy redirects */}
                    <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/dashbord" element={<Navigate to="/admin/dashboard" replace />} />
                    
                  
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
