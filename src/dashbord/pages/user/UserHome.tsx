import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/utils/axiosInstance"
export default function UserHome() {
  const navigate= useNavigate()
  const hadnlecheck =()=>{
    const flag = localStorage.getItem("flag")
    if(flag==="true"){
      navigate("/admin/dashboard")
    }else{
      navigate("/login")
    } 

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
    <div className="p-4 flex justify-end"> 

      <Button className=" bg-green-500 hover:bg-green-600" onClick={hadnlecheck} >Login</Button>
      </div>
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to 
              <span className="text-green-600 dark:text-green-400"> DairyFarm</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Your trusted partner for fresh, high-quality dairy products. 
              From farm to table, we ensure the best for your family.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Order Now
              </button>
              <button className="px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Dairy Products?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're committed to providing the freshest, most nutritious dairy products 
              with sustainable farming practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                100% Fresh
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our products are delivered fresh daily, ensuring maximum quality and taste.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Naturally Organic
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our cattle graze on organic pastures, producing naturally healthy milk.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quick and reliable delivery service to get fresh products to your door.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600 dark:bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Fresh Dairy?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their daily dairy needs.
          </p>
          <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200">
            Start Your Order
          </button>
        </div>
      </div>
    </div>
  )
}
