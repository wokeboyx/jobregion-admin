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

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
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
