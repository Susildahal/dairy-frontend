import { Outlet } from "react-router-dom"

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}
