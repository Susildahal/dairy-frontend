import React from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  linkname: string;
  linkto: string;
}

const AdminHeader = ({ title, subtitle, linkname, linkto }: AdminHeaderProps) => {
  return (
    <div className="mb-6 flex  justify-between  ">
    
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-sm hidden md:block text-gray-600 dark:text-gray-400">
              {subtitle}
            </CardDescription>
          </div>
        </div>

        {/* Right Section */}
      
      
        <Link to={linkto} className=" ">
          <Button
            className=" sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            size="sm"
          >
            {linkname}
          </Button>
        </Link>
    </div>
  );
};

export default AdminHeader;
