import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  X,
  Search
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../../store/store"

interface SidebarProps {
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
}

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
    title: "Add Daily Milk",
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
   {
    title: "User Daily Reports",
    icon: Calendar,
    href: "/admin/user-daily",
  },
]
export function Sidebar({ className, onCollapsedChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const location = useLocation()
  const pathname = location.pathname
  const { data } = useSelector((state: RootState) => state.mee)

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const filteredItems = sidebarItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 bg-white dark:bg-gray-800 shadow-lg border"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 fixed left-0 top-0 z-40 shadow-lg",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dairy Farm
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                        isCollapsed ? "px-2" : "px-3",
                        pathname === item.href && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-r-2 border-green-500",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.title}
                      {/* Arrow pointing to the icon */}
                      <div className="absolute left-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-gray-900 dark:border-r-gray-700"></div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {data?.name ? data.name.charAt(0).toUpperCase() : "A"}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {data?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {data?.email || "admin@dairy.com"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-50 w-64 shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col w-full h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dairy Farm
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobile}
              className="h-8 w-8 text-gray-600 dark:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 transition-colors",
                      pathname === item.href && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-r-2 border-green-500",
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
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
      </div>
    </>
  )
}
