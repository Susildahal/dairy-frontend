import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, Plus } from "lucide-react"

const AdminHeader = ({title ,subtitle ,linkname ,linkto }) => {
  interface Props {
    title: string,
    subtitle: string,
    linkname: string,
    linkto: string
  }
  return (
    <div>
         <div className="mb-6">
        
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </CardDescription>
              </div>
            </div>
            
            {/* Create User Button */}
            <Link to={linkto}>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                size="sm"
              >
               
               {linkname}
              </Button>
            </Link>
          </div>
      
      </div>
    </div>
  )
}

export default AdminHeader
