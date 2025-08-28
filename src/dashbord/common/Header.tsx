

import { Settings, User, Menu, Home, Users, BarChart3, FileText, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { getmee } from "../../store/slices/meeSlicer"
import { useEffect } from "react"
import { RootState, AppDispatch } from "../../store/store"
import axiosInstance from "@/utils/axiosInstance"
const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/admin/dashboard",
  },
  {
    title: "Users Details",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Create User",
    icon: Users,
    href: "/admin/users/create",
  },
  {
    title: "Manage Daily Milk",
    icon: FileText,
    href: "/admin/milk",
  },
  {
    title: "Add Month",
    icon: BarChart3,
    href: "/admin/add-month",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "User Monthly Reports",
    icon: Mail,
    href: "/admin/user-reports",
  },
  {
    title: "Admin Monthly Reports",
    icon: Calendar,
    href: "/admin/admin-reports",
  },
]

const handleLogout =()=>{
 
  axiosInstance.post("/users/user/logout").then((response) => { 
     localStorage.removeItem("flag")
    console.log(response)
    window.location.href = "/login"
  }).catch((error) => {
    console.error("Logout failed:", error)
    window.location.href = "/login"
  })
}


export function Header() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, error } = useSelector((state: RootState) => state.mee)

  useEffect(() => {
    if(!data)
      dispatch(getmee())
  }, [dispatch])

  
  const location = useLocation()
  const pathname = location.pathname
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60">
      <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left side - Title and mobile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center p-4 h-14 sm:h-16 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dairy Farm</h2>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3",
                            pathname === item.href && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span>{item.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-1 w-1 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {data?.name ? data.name.charAt(0).toUpperCase() : "A"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {data?.name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {data?.email || "admin@dairy.com"}
                      </p>
                    
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Page Title - visible on larger screens */}
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Right side - User menu and actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Notifications - visible on larger screens */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-2 w-3 sm:h-9 sm:w-9 md:h-4 md:w-4 rounded-full p-0">
                <Avatar className="h-2 w-2 sm:h-4 sm:w-4 md:h-10 md:w-10">
                  <AvatarImage src={data?.avatar || "/diverse-user-avatars.png"} alt="User" />
                  <AvatarFallback className="text-xs sm:text-sm bg-green-500 text-white">
                    {data?.name ? data.name.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    Name: {data?.name || "Admin User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    Email: {data?.email || "admin@dairy.com"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    Role: {data?.role || "Admin"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    Phone: {data?.phone || "343422334"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <span onClick={handleLogout}>  Log out</span>
              
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
