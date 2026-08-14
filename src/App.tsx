import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import MyAccount from "./pages/MyAccount";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import VendorWidget from "./pages/VendorWidget";
import RegisterChoice from "./pages/RegisterChoice";
import BrideRegistration from "./pages/BrideRegistration";
import VendorRegistration from "./pages/VendorRegistration";
import VendorDashboard from "./pages/VendorDashboard";
import VendorPlaceholder from "./pages/VendorPlaceholder";
import AddProduct from "./pages/AddProduct";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/bride" element={<BrideRegistration />} />
          <Route path="/register/vendor" element={<VendorRegistration />} />
          <Route path="/bride/dashboard" element={
            <ProtectedRoute accountType="individual">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/bride/products" element={
            <ProtectedRoute accountType="individual">
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/bride/products/new" element={<ProtectedRoute accountType="individual"><AddProduct /></ProtectedRoute>} />
          <Route path="/bride/orders" element={<Navigate to="/bride/dashboard" replace />} />
          <Route path="/bride/my-account" element={
            <ProtectedRoute accountType="individual">
              <MyAccount />
            </ProtectedRoute>
          } />
          <Route path="/vendor/dashboard" element={<ProtectedRoute accountType="business"><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/profile" element={<ProtectedRoute accountType="business"><VendorPlaceholder page="profile" /></ProtectedRoute>} />
          <Route path="/vendor/products" element={<ProtectedRoute accountType="business"><VendorPlaceholder page="products" /></ProtectedRoute>} />
          <Route path="/vendor/orders" element={<ProtectedRoute accountType="business"><VendorPlaceholder page="orders" /></ProtectedRoute>} />
          <Route path="/vendor/account" element={<ProtectedRoute accountType="business"><VendorPlaceholder page="account" /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
          <Route path="/admin/users/:email" element={<AdminProtectedRoute><AdminUserDetail /></AdminProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/bride/dashboard" replace />} />
          <Route path="/products" element={<Navigate to="/bride/products" replace />} />
          <Route path="/orders" element={<Navigate to="/bride/dashboard" replace />} />
          <Route path="/my-account" element={<Navigate to="/bride/my-account" replace />} />
          <Route path="/arcade-widget" element={<VendorWidget />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
