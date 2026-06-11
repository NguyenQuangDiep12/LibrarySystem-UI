import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layouts/PublicLayout'
import ReaderLayout from './components/layouts/ReaderLayout'
import AdminLayout from './components/layouts/AdminLayout'
import { ROLES } from './constants/roles'

import HomePage from './pages/public/HomePage'
import BookDetailPage from './pages/public/BookDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'

import ProfilePage from './pages/reader/ProfilePage'
import BorrowHistoryPage from './pages/reader/BorrowHistoryPage'
import BorrowRecordDetailPage from './pages/reader/BorrowRecordDetailPage'
import NotificationsPage from './pages/reader/NotificationsPage'

import DashboardPage from './pages/admin/DashboardPage'
import StatisticsPage from './pages/admin/StatisticsPage'
import BooksPage from './pages/admin/BooksPage'
import BookFormPage from './pages/admin/BookFormPage'
import BookCopiesPage from './pages/admin/BookCopiesPage'
import BookCopyDetailPage from './pages/admin/BookCopyDetailPage'
import AuthorsPage from './pages/admin/AuthorsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import PublishersPage from './pages/admin/PublishersPage'
import BorrowRecordsPage from './pages/admin/BorrowRecordsPage'
import AdminBorrowRecordDetailPage from './pages/admin/AdminBorrowRecordDetailPage'
import ReservationsPage from './pages/admin/ReservationsPage'
import FinesPage from './pages/admin/FinesPage'
import UsersPage from './pages/admin/UsersPage'
import UserDetailPage from './pages/admin/UserDetailPage'
import StaffsPage from './pages/admin/StaffsPage'

import ForbiddenPage from './pages/ForbiddenPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
      </Route>

      {/* Auth routes (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* Reader routes */}
      <Route
        path="/reader"
        element={
          <ProtectedRoute roles={[ROLES.READER, ROLES.STAFF, ROLES.ADMIN]}>
            <ReaderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="borrow-history" element={<BorrowHistoryPage />} />
        <Route path="borrow-records/:id" element={<BorrowRecordDetailPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.STAFF, ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/create" element={<BookFormPage />} />
        <Route path="books/:id/edit" element={<BookFormPage />} />
        <Route path="book-copies" element={<BookCopiesPage />} />
        <Route path="book-copies/:id" element={<BookCopyDetailPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="publishers" element={<PublishersPage />} />
        <Route path="borrow-records" element={<BorrowRecordsPage />} />
        <Route path="borrow-records/:id" element={<AdminBorrowRecordDetailPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="fines" element={<FinesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="staffs" element={<StaffsPage />} />
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
