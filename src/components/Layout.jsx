import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}