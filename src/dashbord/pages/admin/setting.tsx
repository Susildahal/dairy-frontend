import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Save, Settings as SettingsIcon, User, Mail, Phone, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { useDispatch, useSelector } from 'react-redux'
import { updatedata, getsettingdata, savedata } from "../../../store/slices/sitesettingSlicer"
import { RootState, AppDispatch } from '../../../store/store'
import Loading from '../../ui/Loading'
import { useEffect } from 'react'


interface SiteSettings {
  name: string
  email: string
  phone: string
  rate_of_user: string
  rate_of_admin: string
}

const Settings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    email: "",
    phone: "",
    rate_of_user: "",
    rate_of_admin: ""
  })

  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.siteSettings);
  
  useEffect(() => {
    // Fetch settings from backend on component mount
    dispatch(getsettingdata());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setSettings({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        rate_of_user: String(data.rate_of_user || ""),
        rate_of_admin: String(data.rate_of_admin || "")
      });
    }
  }, [data]);

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Use savedata if no data exists, otherwise use updatedata
      if (!data) {
        await dispatch(savedata(settings)).unwrap()
      } else {
        await dispatch(updatedata(settings)).unwrap()
      }
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error("Failed to save settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings({
      name: "sushil dahal",
      email: "susil@gmail.com",
      phone: "123456789",
      rate_of_user: "12",
      rate_of_admin: "12"
    })
    toast.info("Settings reset to default values")
  }

  // Early return AFTER all hooks are declared
  if (loading === "loading") {
    return <Loading />
  }

  return (
    <div className="space-y-6  mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Site Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your dairy farm management system settings
        </p>
      </div>

      <Separator />

      {/* Settings Form */}
      <div className="grid gap-6">
        {/* Site Information */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <User className="h-5 w-5" />
              Site Information
            </CardTitle>
            <CardDescription>
              Basic information about your dairy farm site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Site Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter site name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Contact Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Contact Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Configuration */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <DollarSign className="h-5 w-5" />
              Rate Configuration
            </CardTitle>
            <CardDescription>
              Set the rates for different user types in your system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate_of_user" className="text-sm font-medium">
                  User Rate (per unit)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="rate_of_user"
                    type="number"
                    value={settings.rate_of_user}
                    onChange={(e) => handleInputChange('rate_of_user', e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter user rate"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Rate charged to regular users for dairy services
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_of_admin" className="text-sm font-medium">
                  Admin Rate (per unit)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="rate_of_admin"
                    type="number"
                    value={settings.rate_of_admin}
                    onChange={(e) => handleInputChange('rate_of_admin', e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter admin rate"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Rate for admin-level services and operations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="sm:w-auto border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Reset to Default
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="sm:w-auto bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Important Notes
              </p>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Changes to rates will affect all future transactions</li>
                <li>• Contact information will be used for system notifications</li>
                <li>• Make sure to save your changes before leaving this page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings
