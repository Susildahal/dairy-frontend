import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, BarChart3, User, LogOut } from "lucide-react"

export default function UserLayout() {
  const location = useLocation()

  const userNavItems = [
    {
      title: "Home",
      icon: Home,
      href: "/",
    },
    {
      title: "My Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-800">Dairy Farm Portal</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4">
              {userNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link key={item.href} to={item.href}>
                    <Button 
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* User actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-green-200">
        <div className="px-4 py-2">
          <div className="flex space-x-1">
            {userNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link key={item.href} to={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-1 ${
                      isActive 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.title}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
