import { createBrowserRouter, Navigate } from 'react-router'
import LoginPage from '../pages/auth/LoginPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/auth" replace /> },
  { path: '/auth', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
])
