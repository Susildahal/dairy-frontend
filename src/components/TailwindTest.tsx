import React from 'react'

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 mb-8 border">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary"></div>
        </div>
        <div>
          <h4 className="text-xl font-medium text-black">Tailwind Test</h4>
          <p className="text-gray-500">Testing Tailwind CSS</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-blue-800">Card 1</h3>
          <p className="text-blue-600">This is a blue card</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-green-800">Card 2</h3>
          <p className="text-green-600">This is a green card</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-purple-800">Card 3</h3>
          <p className="text-purple-600">This is a purple card</p>
        </div>
      </div>
      
      <div className="mt-8">
        <button className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
          Tailwind Button
        </button>
      </div>
    </div>
  )
}

export default TailwindTest
