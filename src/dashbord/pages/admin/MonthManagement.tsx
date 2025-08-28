import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Trash2,
  Filter,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { 
  createMonth, 
  getAllMonths, 
  getMonthsByYear, 
  activateMonth, 
  deleteMonth,
  clearError 
} from '../../../store/slices/monthslicer'
import Loading from '../../ui/Loading'

interface CreateMonthForm {
  year: number
  month: string
  status: boolean
}

const MONTHS = [
  'Baiskake', 'jeth', 'Ashar', 'shawarn', 'Bhadra', 'ashoj',
  'Kartik', 'Mangshir', 'Poush', 'Magh', 'Falgun', 'Chitra'
]

const MonthManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<CreateMonthForm>({
    year: new Date().getFullYear(),
    month: '',
    status: false
  })
  const [filterYear, setFilterYear] = useState<string>('all')
  
  const dispatch = useDispatch<AppDispatch>()
  const { 
    months, 
    activeMonth, 
    loading, 
    error, 
    createLoading, 
    deleteLoading, 
    activateLoading 
  } = useSelector((state: RootState) => state.months)

  useEffect(() => {
    dispatch(getAllMonths())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.month) {
      toast.error("Please select a month")
      return
    }

    try {
      await dispatch(createMonth(formData)).unwrap()
      toast.success("Month created successfully!")
      setIsModalOpen(false)
      setFormData({
        year: new Date().getFullYear(),
        month: '',
        status: false
      })
    } catch (error) {
      console.error('Failed to create month:', error)
    }
  }

  const handleActivate = async (monthId: string) => {
    try {
      await dispatch(activateMonth(monthId)).unwrap()
      toast.success("Month activated successfully!")
    } catch (error) {
      console.error('Failed to activate month:', error)
    }
  }

  const handleDelete = async (monthId: string, monthName: string, year: number) => {
    if (window.confirm(`Are you sure you want to delete ${monthName} ${year}?`)) {
      try {
        await dispatch(deleteMonth(monthId)).unwrap()
        toast.success("Month deleted successfully!")
      } catch (error) {
        console.error('Failed to delete month:', error)
      }
    }
  }

  const handleFilterChange = (year: string) => {
    setFilterYear(year)
    if (year === 'all') {
      dispatch(getAllMonths())
    } else {
      dispatch(getMonthsByYear(parseInt(year)))
    }
  }

 

  const filteredMonths = months.filter(month => 
    filterYear === 'all' || month.year.toString() === filterYear
  )

  if (loading === "loading") {
    return <Loading />
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-sm font-bold text-gray-900 dark:text-white">
                Month Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage dairy farm operational months and activate current period
              </p>
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Month
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Create New Month
                </DialogTitle>
                <DialogDescription>
                  Add a new month to the dairy farm management system
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Year and Month Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min={2000}
                      max={2100}
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      required
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month" className="text-sm font-medium">
                      Month <span className="text-red-500">*</span>
                    </Label>
                    <Select  
                      value={formData.month} 
                      onValueChange={(value) => setFormData({...formData, month: value})}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status Switch */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Set as active month
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        This will deactivate all other months
                      </p>
                    </div>
                    <Switch
                      id="status"
                      checked={formData.status}
                      onCheckedChange={(checked) => setFormData({...formData, status: checked})}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>

                {/* Warning Message */}
                {formData.status && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Important Notice
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Setting this month as active will automatically deactivate all other months in the system.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 order-2 sm:order-1"
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLoading || !formData.month}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 order-1 sm:order-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Month
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Active Month Card */}
      {activeMonth && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <CardHeader className="">
            <CardTitle className="flex items-center  text-green-700 dark:text-green-300">
              <CheckCircle className="h-2 w-2" />
              Currently Active Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center ">
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {activeMonth.month} {activeMonth.year}
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {activeMonth.createdAt ? 
                  `Created: ${new Date(activeMonth.createdAt).toLocaleDateString()}` : 
                  'Recently created'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Year:</span>
          <Select value={filterYear} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from(new Set(months.map(m => m.year))).sort((a, b) => b - a).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredMonths.length} month(s) {filterYear !== 'all' ? `for year ${filterYear}` : 'total'}
        </div>
      </div>

      {/* Months Table
      <Card className="shadow-sm p-3">
      
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Months Overview</CardTitle>
              <CardDescription className="mt-1">
                {filteredMonths.length} month(s) {filterYear !== 'all' ? `for year ${filterYear}` : 'total'}
              </CardDescription>
            </div>
          </div>
        </Card> */}
      
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold">Month</TableHead>
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMonths.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">No months found</p>
                          <p className="text-sm text-gray-400">
                            {filterYear !== 'all' 
                              ? `No months created for year ${filterYear}` 
                              : 'Create your first month to get started'
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMonths.map((month) => (
                    <TableRow key={month._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium py-4">{month.month}</TableCell>
                      <TableCell className="py-4">{month.year}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={month.status}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleActivate(month._id)
                              } else {
                                toast.info("To deactivate this month, please activate another month first")
                              }
                            }}
                            disabled={activateLoading}
                            className="data-[state=checked]:bg-green-600"
                          />
                          {month.status ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              <Circle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600 dark:text-gray-400">
                        {month.createdAt ? new Date(month.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!month.status ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(month._id, month.month, month.year)}
                              disabled={deleteLoading}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">
                                Active month
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
   

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">i</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-base font-semibold text-blue-800 dark:text-blue-200">
                Month Management Guidelines
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Only one month can be active at a time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Active months cannot be deleted - activate another month first</span>
                  </li>
                </ul>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Creating an active month will automatically deactivate others</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Each year-month combination must be unique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MonthManagement
