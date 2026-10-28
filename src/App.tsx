import { Routes, Route } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import DashboardPage from "@/screens/dashboard"
import JobsPage from "@/screens/jobs"
import JobDetailPage from "@/screens/jobs/detail"
import CategoriesPage from "@/screens/categories"
import UsersPage from "@/screens/users"
import UserDetailPage from "@/screens/users/detail"
import PromotionsPage from "@/screens/promotions"
import PromotionDetailPage from "@/screens/promotions/detail"
import SubscriptionsPage from "@/screens/subscriptions"
import BlogPage from "@/screens/blog"
import BlogEditPage from "@/screens/blog/detail"
import AdminsPage from "@/screens/admins"
import AuditLogPage from "@/screens/audit-log"
import SupportPage from "@/screens/support"
import ArticleEditPage from "@/screens/support/detail"
import ReportsPage from "@/screens/reports"
import ReportDetailPage from "@/screens/reports/detail"
import CategoryDetailPage from "@/screens/categories/detail"
import ReviewsPage from "@/screens/reviews"
import PostJobPage from "@/screens/post-job"
import JobSourcesPage from "@/screens/job-sources"
import JobSourceDetailPage from "@/screens/job-sources/detail"
import PaymentsPage from "@/screens/payments"
import SettingsPage from "@/screens/settings"
import AnnouncementsPage from "@/screens/announcements"
import InboxPage from "@/screens/inbox"

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<PostJobPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="job-sources" element={<JobSourcesPage />} />
        <Route path="job-sources/:id" element={<JobSourceDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="inbox/*" element={<InboxPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:id" element={<CategoryDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:id" element={<ReportDetailPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="promotions/:id" element={<PromotionDetailPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:id" element={<BlogEditPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="support/articles/:id" element={<ArticleEditPage />} />
      </Route>
    </Routes>
  )
}

export default App
