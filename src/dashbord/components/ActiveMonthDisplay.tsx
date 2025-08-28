import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store/store'
import { getActiveMonth } from '../../store/slices/monthslicer'

interface ActiveMonthDisplayProps {
  showTitle?: boolean
  compact?: boolean
  className?: string
}

const ActiveMonthDisplay: React.FC<ActiveMonthDisplayProps> = ({ 
  showTitle = true, 
  compact = false,
  className = ""
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { activeMonth, loading } = useSelector((state: RootState) => state.months)

  useEffect(() => {
    if (!activeMonth) {
      dispatch(getActiveMonth())
    }
  }, [dispatch, activeMonth])

  if (loading === "loading") {
    return (
      <Card className={`border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <span className="text-sm text-gray-500">Loading active month...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activeMonth) {
    return (
      <Card className={`border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 ${className}`}>
        {showTitle && !compact && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="h-4 w-4" />
              Active Month
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? "p-3" : "pt-2"}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-300">
              No active month set
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Please set an active month in Month Management
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 ${className}`}>
      {showTitle && !compact && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
            <Calendar className="h-4 w-4" />
            Active Period
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-3" : "pt-2"}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className={`font-semibold text-green-800 dark:text-green-200 ${compact ? 'text-sm' : 'text-base'}`}>
              {activeMonth.month} {activeMonth.year}
            </span>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActiveMonthDisplay
