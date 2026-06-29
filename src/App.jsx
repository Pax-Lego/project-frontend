import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import IngredientsPage from './pages/ingredients/IngredientsPage'
import RecipesPage from './pages/recipes/RecipesPage'
import PlansPage from './pages/plans/PlansPage'
import ProfilePage from './pages/profile/ProfilePage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index             element={<DashboardPage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="recipes"     element={<RecipesPage />} />
        <Route path="plans"       element={<PlansPage />} />
        <Route path="profile"     element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}