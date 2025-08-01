import './App.css'
import { AuthProvider } from './Context/AuthContext.jsx'
import Home from './Home.jsx'
import Login from './Login/Login.jsx'
import Register from './Login/Register.jsx'
import Service from './Components/Service/Service.jsx'
import Guide from './Components/Guide/Guide.jsx'
import Pricing from './Components/Pricing/Pricing.jsx'
import GoogleCallback from './Login/GoogleCallback.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import CompleteProfile from "./Login/CompleteProfile";
import FormPage from './FormADN/BookingPage.jsx'

import AdminDashboard from './Admin/AdminDashboard.jsx'
import StaffDashboard from './Staff/pages/StaffDashboard.jsx'

import PrivateRouter from './Context/PrivateRouter.jsx'

import LabDashboard from "./Lab/LabDashboard.jsx"

import EnterResult from './Lab/EnterResult.jsx'

import StaffBookings from './Staff/pages/StaffBookings.jsx'
import SampleCollection from './Staff/pages/SampleCollection.jsx'
import CollectionHistory from './Staff/pages/CollectionHistory.jsx'
import StaffProfile from './Staff/pages/StaffProfile.jsx'

import EnterKitInfo from './FormADN/EnterKitInfo/EnterKitInfo.jsx';

import DanSuForm from './FormADN/Components/DanSuForm.jsx'
import HanhChinhForm from './FormADN/Components/HanhChinhForm.jsx'
import ListPage from './FormADN/ListPage.jsx'
import PaymentResultPage from './FormADN/PaymentResult.jsx'
import CustomerProfile from './Customer/CustomerProfile.jsx'
import LookupResult from './Components/SearchResult/LookupResult.jsx'

import CreateAccount from "./Admin/CreateAccount.jsx"
import AccountManage from "./Admin/AccountManage.jsx"
import CustomerManage from "./Admin/CustomerManage.jsx"
import ServiceManage from "./Admin/ServiceManage.jsx"
import BlogManage from "./Admin/BlogManage.jsx"
import BlogEdit from "./Admin/BlogEdit.jsx"
import NewBlog from "./Admin/NewBlog.jsx"
import BlogDetail from "./Knowledge/BlogDetail.jsx"
import BlogList from "./Knowledge/BlogList.jsx"
import KitManage from './Admin/KitManage';
import AdminRoute from './Context/AdminRoute.jsx'


function App() {
  return (
    <GoogleOAuthProvider clientId="443615178916-5p9djk25jon368lljhovev11s40p19j1.apps.googleusercontent.com">

      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/service" element={<Service />} />
            <Route path="/knowledge" element={<BlogList />} />
            <Route path="/blog-list" element={<BlogList />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/guide" element={<Guide/>} />
            <Route path="/pricing" element={<Pricing/>} />
            
            <Route path="/result" element={<LookupResult />} />
            <Route path="/oauth2/callback" element={<GoogleCallback />} />
            <Route path="/completeprofile" element={<CompleteProfile />} />
            <Route path="/form" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <FormPage />
              </PrivateRouter>
            } />


            {/* ADMIN */}
            <Route path="/create-account" element={<AdminRoute><CreateAccount /></AdminRoute>} />
            <Route path="/account-manage" element={<AdminRoute><AccountManage /></AdminRoute>} />
            <Route path="/customer-manage" element={<AdminRoute><CustomerManage /></AdminRoute>} />
            <Route path="/service-manage" element={<AdminRoute><ServiceManage /></AdminRoute>} />
            <Route path="/blog-manage" element={<AdminRoute><BlogManage /></AdminRoute>} />
            <Route path="/blog-edit/:id" element={<AdminRoute><BlogEdit /></AdminRoute>} />
            <Route path="/new-blog" element={<AdminRoute><NewBlog /></AdminRoute>} />
            <Route path="/kit-manage" element={<KitManage />} />
            <Route path="/admin/dashboard" element={
              <PrivateRouter allowedRole="ADMIN">
                <AdminDashboard />
              </PrivateRouter>
            } />

            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/lab/enter-result" element={<EnterResult />} />

            {/* <Route path="/lab/dashboard" element={
              <PrivateRouter allowedRole="LAB_STAFF">
                <LabDashboard />
              </PrivateRouter>
            } /> */}


            <Route path="/unauthorized" element={
              <div style={{ padding: 40, textAlign: "center", color: "red", fontWeight: "bold" }}>
                Bạn không có quyền truy cập trang này.
              </div>
            } />

            {/* CUSTOMER */}
            <Route path="/customer/enter-kit-info" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <EnterKitInfo />
              </PrivateRouter>
            } />
            <Route path="/customer/dansu" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <DanSuForm />
              </PrivateRouter>
            } />
            <Route path="/customer/hanhchinh" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <HanhChinhForm />
              </PrivateRouter>
            } />
            <Route path="/customer/list" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <ListPage />
              </PrivateRouter>
            } />
            <Route path="/payment-result" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <PaymentResultPage />
              </PrivateRouter>
            } />
            <Route path="/customer/profile" element={
              <PrivateRouter allowedRole="CUSTOMER">
                <CustomerProfile />
              </PrivateRouter>
            } />    


            {/* STAFF */}
            <Route path="/staff/dashboard" element={
              <PrivateRouter allowedRole="RECORDER_STAFF">
                <StaffDashboard />
              </PrivateRouter>
            } />
            <Route path="/staff/bookings" element={
              <PrivateRouter allowedRole="RECORDER_STAFF">
                <StaffBookings />
              </PrivateRouter>
            } />
            <Route path="/staff/collection" element={
              <PrivateRouter allowedRole="RECORDER_STAFF">
                <SampleCollection />
              </PrivateRouter>
            } />
            <Route path="/staff/history" element={
              <PrivateRouter allowedRole="RECORDER_STAFF">
                <CollectionHistory />
              </PrivateRouter>
            } />
            <Route path="/staff/profile" element={
              <PrivateRouter allowedRole="RECORDER_STAFF">
                <StaffProfile />
              </PrivateRouter>
            } />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
export default App