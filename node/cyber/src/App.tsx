import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { 
  LoginPage, 
  DashboardPage,
  HelpdeskPage,
  MeetingRoomPage,
  ProfilePage,
  LeavePage,
  AttendancePage,
  PurchaseOrderPage,
  VendorPage,
  InventoryPage,
  StockMovementPage
} from './pages'
import { ProtectedRoute } from './components'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/helpdesk" 
          element={
            <ProtectedRoute>
              <HelpdeskPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/meeting" 
          element={
            <ProtectedRoute>
              <MeetingRoomPage />
            </ProtectedRoute>
          } 
        />

        {/* eHRM Routes */}
        <Route 
          path="/ehrm/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ehrm/leave" 
          element={
            <ProtectedRoute>
              <LeavePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ehrm/attendance" 
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          } 
        />

        {/* eSupplyChain Routes */}
        <Route 
          path="/supply/order" 
          element={
            <ProtectedRoute>
              <PurchaseOrderPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/supply/vendor" 
          element={
            <ProtectedRoute>
              <VendorPage />
            </ProtectedRoute>
          } 
        />

        {/* Warehouse Routes */}
        <Route 
          path="/warehouse/inventory" 
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/warehouse/stock" 
          element={
            <ProtectedRoute>
              <StockMovementPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
