/**
 * Main Application Component - Rabit HR Platform
 * Version: 3.0.1
 * This component sets up the routing, providers, and global UI components.
 */
import { lazy, Suspense, ComponentType, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";
import { ChatWidget } from "./components/ChatWidget";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { AdminLayout } from "./components/AdminLayout";
import { HeaderRedesigned } from "./components/HeaderRedesigned";
import { SkipLink } from "./components/SkipLink";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { RouteAnnouncer } from "./components/RouteAnnouncer";
import { useAuth } from "./_core/hooks/useAuth";
import { getDashboardPath } from "./lib/navigation";
import { useWebVitals } from "./lib/performance";
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from "./components/PWAPrompts";
import { useServiceWorker } from "./hooks/usePWA";
import { useFocusVisible } from "./hooks/useAccessibility";
import { useARIAEnhancer, useARIAValidation } from "./lib/ariaUtils";
import { useAnalytics, usePageTracking } from "./hooks/useAnalytics";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AIAssistant } from "./components/ai/AIAssistant";

// Debug logging for app initialization
const APP_VERSION = "3.0.1";
console.log(`[Rabit] App.tsx loading... (v${APP_VERSION})`);

// Retry helper for lazy loading with cache busting
const lazyRetry = <T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  retries = 2
): React.LazyExoticComponent<T> => {
  return lazy(async () => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await factory();
      } catch (error) {
        if (i === retries) {
          // Clear service worker cache and reload on final failure
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          throw error;
        }
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
    throw new Error("Failed to load module");
  });
};

const ENABLE_DEMO_PAGES = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMOS === "true";
const loadDemoPage = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => (ENABLE_DEMO_PAGES ? lazyRetry(factory) : null);

// Loading component - Enhanced with better UX
const PageLoader = () => <LoadingSpinner fullScreen text="جاري التحميل..." />;

// Lazy load pages - Public pages (loaded first) with retry logic
const HomeRedesigned = lazyRetry(() => import("./pages/HomeRedesigned"));
const EnhancedHome = lazyRetry(() => import("./pages/EnhancedHome"));
const LoginRedesigned = lazyRetry(() => import("./pages/LoginRedesigned"));
const Register = lazy(() => import("./pages/Register"));
const AccountTypeRedesigned = lazy(() => import("./pages/AccountTypeRedesigned"));
const GuidedTour = lazy(() => import("./pages/GuidedTour"));

// Auth pages
const SignupEmployee = lazy(() => import("./pages/SignupEmployee"));
const SignupConsultant = lazy(() => import("@/pages/SignupConsultant"));
const SignupCompany = lazy(() => import("./pages/SignupCompany"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const ConsultantLogin = lazy(() => import("@/pages/ConsultantLogin"));
const ConsultantRegister = lazy(() => import("./pages/ConsultantRegister"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Dashboard pages (high priority - loaded on demand)
const CompanyDashboardRedesigned = lazy(
  () => import("./pages/dashboard/CompanyDashboardRedesigned")
);
const EnhancedCompanyDashboard = lazy(() => import("./pages/company/EnhancedCompanyDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboardNew"));
const EnhancedEmployeeDashboard = lazy(() => import("./pages/employee/EnhancedEmployeeDashboard"));
const ConsultantDashboard = lazy(() => import("./pages/ConsultantDashboard"));
const AdminDashboardNew = lazy(() => import("./pages/admin/Dashboard"));
const EnhancedAdminDashboard = lazy(() => import("./pages/admin/EnhancedAdminDashboard"));
const ProfileRedesigned = lazy(() => import("./pages/ProfileRedesigned"));

// Document & Tools
const DocumentGenerator = lazy(() => import("./pages/DocumentGenerator"));
const MyDocuments = lazy(() => import("./pages/MyDocuments"));
const EndOfServiceCalculator = lazy(
  () => import("./pages/EndOfServiceCalculator")
);
const LeaveCalculator = lazy(() => import("./pages/LeaveCalculator"));
const LetterGenerator = lazy(() => import("./pages/LetterGenerator"));
const ToolsRedesigned = lazy(() => import("./pages/ToolsRedesigned"));
const DashboardTools = lazy(() => import("./pages/dashboard/Tools"));

// Dashboard sub-pages
const Employees = lazy(() => import("./pages/dashboard/EmployeesManagement"));
const AtsManagement = lazy(() => import("./pages/dashboard/ATSManagement"));
const Tickets = lazy(() => import("./pages/dashboard/TicketsManagement"));
const Tasks = lazy(() => import("./pages/dashboard/TasksManagement"));
const Reports = lazy(() => import("./pages/dashboard/ReportsManagement"));
const Settings = lazy(() => import("./pages/dashboard/SettingsManagement"));
const Certificates = lazy(() => import("@/pages/dashboard/Certificates"));
const LegalCheck = lazy(() => import("@/pages/dashboard/LegalCheck"));
const Templates = lazy(() => import("./pages/dashboard/Templates"));
const Reminders = lazy(() => import("./pages/dashboard/Reminders"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));
const ExecutiveDashboard = lazy(() => import("./pages/dashboard/ExecutiveDashboard"));

// New Feature Pages
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const TrainingPage = lazy(() => import("./pages/dashboard/TrainingPage"));
const InterviewsPage = lazy(() => import("./pages/dashboard/InterviewsPage"));
const PerformancePage = lazy(() => import("./pages/dashboard/PerformancePage"));
const MessagingPage = lazy(() => import("./pages/dashboard/MessagingPage"));
const ReportsPage = lazy(() => import("./pages/dashboard/ReportsPage"));

// Consulting pages
const ConsultingRedesigned = lazy(() => import("./pages/ConsultingRedesigned"));
const ConsultingBook = lazy(() => import("./pages/ConsultingBook"));
const ConsultantsList = lazy(() => import("./pages/ConsultantsList"));
const ConsultingServices = lazy(() => import("./pages/ConsultingServices"));
const HowToBook = lazy(() => import("./pages/HowToBook"));
const ConsultingExperts = lazy(() => import("./pages/ConsultingExperts"));
const ConsultingBookingNew = lazy(() => import("./pages/ConsultingBookingNew"));
const ConsultingExpertProfile = lazy(
  () => import("./pages/ConsultingExpertProfile")
);
const MyConsultations = lazy(() => import("./pages/MyConsultations"));
const ConsultationDetail = lazy(() => import("./pages/ConsultationDetail"));
const ConsultationChat = lazy(() => import("./pages/ConsultationChat"));

// Content pages
const AboutRedesigned = lazy(() => import("./pages/AboutRedesigned"));
const ContactRedesigned = lazy(() => import("./pages/ContactRedesigned"));
const FAQRedesigned = lazy(() => import("./pages/FAQRedesigned"));
const BlogRedesigned = lazy(() => import("./pages/BlogRedesigned"));
const NotFoundRedesigned = lazy(() => import("./pages/NotFoundRedesigned"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KnowledgeBaseArticle = lazy(() => import("./pages/KnowledgeBaseArticle"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));

// Legal & Policy pages
const Privacy = lazy(() => import("./pages/Privacy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const MyData = lazy(() => import("./pages/MyData"));
const DataProtectionContact = lazy(
  () => import("./pages/DataProtectionContact")
);
const Compliance = lazy(() => import("./pages/Compliance"));
const ComponentShowcase = loadDemoPage(() => import("./pages/ComponentShowcase"));

// Admin pages
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminChat = lazy(() => import("./pages/admin/Chat"));
const AdminDiscountCodes = lazy(() => import("./pages/AdminDiscountCodes"));
const AdminDataRequests = lazy(() => import("./pages/admin/DataRequests"));
const AdminSecurityIncidents = lazy(
  () => import("./pages/admin/SecurityIncidents")
);

// Other pages
const PricingRedesigned = lazy(() => import("./pages/PricingRedesigned"));
const Services = lazy(() => import("./pages/Services"));
const BrandPreview = lazy(() => import("./pages/BrandPreview"));
const TrialAccounts = lazy(() => import("./pages/TrialAccounts"));
const VerifyDecision = lazy(() => import("./pages/VerifyDecision"));
const Payment = lazy(() => import("./pages/Payment"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutNew = lazy(() => import("./pages/CheckoutNew"));
const MoyasarCallback = lazy(() => import("./pages/MoyasarCallback"));
const TapCallback = lazy(() => import("./pages/TapCallback"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const AIChat = loadDemoPage(() => import("./pages/AIChat"));
const AIAnalytics = loadDemoPage(() => import("./pages/AIAnalytics"));
const AIPerformanceEvaluator = loadDemoPage(() => import("./pages/AIPerformanceEvaluator"));

// Saudi Regulations & AI Tools pages
const SaudiRegulations = lazy(() => import("./pages/SaudiRegulations"));
const FinancialCalculators = lazy(() => import("./components/calculators/FinancialCalculators").then(m => ({ default: m.CalculatorsPage })));
const AIDashboard = lazy(() => import("./pages/AIDashboard"));

const DashboardRedirect = () => {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  if (loading) return <PageLoader />;
  return <Redirect to={getDashboardPath(user)} />;
};

const withPublicOnly = (Component: ComponentType) => () =>
  (
    <PublicOnlyRoute>
      <Component />
    </PublicOnlyRoute>
  );

// Protected route wrappers
const ProtectedEmployeeDashboard = () => (
  <ProtectedRoute requiredRole="employee">
    <EmployeeDashboard />
  </ProtectedRoute>
);

const ProtectedPayment = () => (
  <ProtectedRoute>
    <Payment planName="اشتراك قياسي" price={500} />
  </ProtectedRoute>
);

const ProtectedCheckoutNew = () => (
  <ProtectedRoute>
    <CheckoutNew />
  </ProtectedRoute>
);

const ProtectedCheckout = () => (
  <ProtectedRoute>
    <Checkout />
  </ProtectedRoute>
);

const ProtectedProfile = () => (
  <ProtectedRoute>
    <ProfileRedesigned />
  </ProtectedRoute>
);

const ProtectedDocumentGenerator = () => (
  <ProtectedRoute>
    <DocumentGenerator />
  </ProtectedRoute>
);

const ProtectedMyDocuments = () => (
  <ProtectedRoute>
    <MyDocuments />
  </ProtectedRoute>
);

const ProtectedAdminRoute = () => (
  <AdminLayout>
    <AdminDiscountCodes />
  </AdminLayout>
);

// Additional Protected Route Wrappers
const ProtectedEnhancedEmployeeDashboard = () => (
  <ProtectedRoute requiredRole="employee">
    <EnhancedEmployeeDashboard />
  </ProtectedRoute>
);

const ProtectedAdminDataRequests = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminDataRequests />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedAdminSecurityIncidents = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminSecurityIncidents />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedConsultantRegister = () => (
  <ProtectedRoute>
    <ConsultantRegister />
  </ProtectedRoute>
);

const ProtectedMyConsultations = () => (
  <ProtectedRoute>
    <MyConsultations />
  </ProtectedRoute>
);

const ProtectedConsultationDetail = () => (
  <ProtectedRoute>
    <ConsultationDetail />
  </ProtectedRoute>
);

const ProtectedConsultationChat = () => (
  <ProtectedRoute>
    <ConsultationChat />
  </ProtectedRoute>
);

const ProtectedConsultantDashboard = () => (
  <ProtectedRoute requiredRole="consultant">
    <ConsultantDashboard />
  </ProtectedRoute>
);

const ProtectedCompanyDashboard = () => (
  <ProtectedRoute requiredRole="company">
    <CompanyDashboardRedesigned />
  </ProtectedRoute>
);

const ProtectedEnhancedCompanyDashboard = () => (
  <ProtectedRoute requiredRole="company">
    <EnhancedCompanyDashboard />
  </ProtectedRoute>
);

const ProtectedAdminDashboard = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminDashboardNew />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedEnhancedAdminDashboard = () => (
  <ProtectedRoute requiredRole="admin">
    <EnhancedAdminDashboard />
  </ProtectedRoute>
);

const ProtectedAdminUsers = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminUsers />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedAdminSubscriptions = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminSubscriptions />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedAdminBookings = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminBookings />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedAdminAuditLogs = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminAuditLogs />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedAdminChat = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <AdminChat />
    </AdminLayout>
  </ProtectedRoute>
);

const ProtectedEmployees = () => (
  <ProtectedRoute requiredRole="company">
    <Employees />
  </ProtectedRoute>
);

const ProtectedAtsManagement = () => (
  <ProtectedRoute requiredRole="company">
    <AtsManagement />
  </ProtectedRoute>
);

const ProtectedTickets = () => (
  <ProtectedRoute requiredRole="company">
    <Tickets />
  </ProtectedRoute>
);

const ProtectedTasks = () => (
  <ProtectedRoute requiredRole="company">
    <Tasks />
  </ProtectedRoute>
);

const ProtectedReports = () => (
  <ProtectedRoute requiredRole="company">
    <Reports />
  </ProtectedRoute>
);

const ProtectedExecutiveDashboard = () => (
  <ProtectedRoute requiredRole="company">
    <ExecutiveDashboard />
  </ProtectedRoute>
);

const ProtectedSettings = () => (
  <ProtectedRoute requiredRole="company">
    <Settings />
  </ProtectedRoute>
);

const ProtectedCertificates = () => (
  <ProtectedRoute requiredRole="company">
    <Certificates />
  </ProtectedRoute>
);

const ProtectedLegalCheck = () => (
  <ProtectedRoute requiredRole="company">
    <LegalCheck />
  </ProtectedRoute>
);

const ProtectedTemplates = () => (
  <ProtectedRoute requiredRole="company">
    <Templates />
  </ProtectedRoute>
);

const ProtectedReminders = () => (
  <ProtectedRoute requiredRole="company">
    <Reminders />
  </ProtectedRoute>
);

const ProtectedDashboardTools = () => (
  <ProtectedRoute requiredRole="company">
    <DashboardTools />
  </ProtectedRoute>
);

const ProtectedNotifications = () => (
  <ProtectedRoute requiredRole="company">
    <Notifications />
  </ProtectedRoute>
);

const ProtectedAnalyticsPage = () => (
  <ProtectedRoute requiredRole="company">
    <AnalyticsPage />
  </ProtectedRoute>
);

const ProtectedTrainingPage = () => (
  <ProtectedRoute requiredRole="company">
    <TrainingPage />
  </ProtectedRoute>
);

const ProtectedInterviewsPage = () => (
  <ProtectedRoute requiredRole="company">
    <InterviewsPage />
  </ProtectedRoute>
);

const ProtectedPerformancePage = () => (
  <ProtectedRoute requiredRole="company">
    <PerformancePage />
  </ProtectedRoute>
);

const ProtectedMessagingPage = () => (
  <ProtectedRoute requiredRole="company">
    <MessagingPage />
  </ProtectedRoute>
);

const ProtectedReportsPage = () => (
  <ProtectedRoute requiredRole="company">
    <ReportsPage />
  </ProtectedRoute>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={HomeRedesigned} />
        <Route path={"/home"} component={EnhancedHome} />
        <Route path={"/signup"} component={withPublicOnly(AccountTypeRedesigned)} />
        <Route path={"/guided/:role"} component={GuidedTour} />
        <Route path={"/signup/employee"} component={SignupEmployee} />
        <Route path={"/signup/consultant"} component={SignupConsultant} />
        <Route path={"/signup/company"} component={SignupCompany} />
        <Route path={"/complete-profile"} component={CompleteProfile} />
        <Route path={"/login"} component={withPublicOnly(LoginRedesigned)} />
        <Route path={"/register"} component={withPublicOnly(Register)} />
        <Route
          path={"/forgot-password"}
          component={withPublicOnly(ForgotPassword)}
        />
        <Route
          path={"/reset-password/:token"}
          component={withPublicOnly(ResetPassword)}
        />
        <Route
          path={"/consultant/login"}
          component={withPublicOnly(ConsultantLogin)}
        />
        <Route
          path={"/employee/dashboard"}
          component={ProtectedEmployeeDashboard}
        />
        <Route
          path={"/employee/dashboard-enhanced"}
          component={ProtectedEnhancedEmployeeDashboard}
        />
        <Route
          path={"/dashboard/employee"}
          component={ProtectedEmployeeDashboard}
        />
        <Route
          path={"/payment"}
          component={ProtectedPayment}
        />
        <Route
          path={"/checkout"}
          component={ProtectedCheckoutNew}
        />
        <Route
          path={"/checkout-old"}
          component={ProtectedCheckout}
        />
        <Route path={"/payment/moyasar/callback"} component={MoyasarCallback} />
        <Route path={"/payment/tap/callback"} component={TapCallback} />
        <Route path={"/payment-success"} component={PaymentSuccess} />
        <Route path={"/payment-failed"} component={PaymentFailed} />
        <Route
          path="/profile"
          component={ProtectedProfile}
        />
        <Route
          path="/document-generator"
          component={ProtectedDocumentGenerator}
        />
        <Route
          path="/my-documents"
          component={ProtectedMyDocuments}
        />
        <Route
          path={"/admin/discount-codes"}
          component={ProtectedAdminRoute}
        />
        <Route path="/contact" component={ContactRedesigned} />
        <Route path="/faq" component={FAQRedesigned} />
        <Route path={"/about"} component={AboutRedesigned} />
        <Route path={"/refund-policy"} component={RefundPolicy} />
        <Route path="/blog" component={BlogRedesigned} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/success-stories" component={SuccessStories} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/my-data" component={MyData} />
        <Route
          path="/data-protection-contact"
          component={DataProtectionContact}
        />
        <Route
          path="/admin/data-requests"
          component={ProtectedAdminDataRequests}
        />
        <Route
          path="/admin/security-incidents"
          component={ProtectedAdminSecurityIncidents}
        />
        <Route path="/terms" component={Terms} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/cookies-policy" component={CookiesPolicy} />
        <Route
          path="/consultant/register"
          component={ProtectedConsultantRegister}
        />
<Route path={"case-studies"} component={CaseStudies} />
        <Route path="/consulting" component={ConsultingRedesigned} />
        <Route path="/consulting/book" component={ConsultingBook} />
        <Route path="/consulting/book-new" component={ConsultingBookingNew} />
        <Route path="/consultants" component={ConsultantsList} />
        <Route path="/consulting/services" component={ConsultingServices} />
        <Route path="/consulting/how-to-book" component={HowToBook} />
        <Route path="/consulting/experts" component={ConsultingExperts} />
        <Route
          path="/consulting/expert/:id"
          component={ConsultingExpertProfile}
        />
        <Route
          path="/my-consultations"
          component={ProtectedMyConsultations}
        />
        <Route
          path="/consultation/:id"
          component={ProtectedConsultationDetail}
        />
        <Route
          path="/consultation/:id/chat"
          component={ProtectedConsultationChat}
        />
        <Route
          path="/consultant-dashboard"
          component={ProtectedConsultantDashboard}
        />
        <Route path={"/courses"} component={Courses} />
        <Route path={"/courses/:id"} component={CourseDetail} />
        <Route path={"/knowledge"} component={Knowledge} />
        <Route path={"/tools"} component={ToolsRedesigned} />
        <Route path={"/knowledge-base"} component={KnowledgeBase} />
        <Route path={"/knowledge-base/:id"} component={KnowledgeBaseArticle} />
        <Route
          path={"/tools/end-of-service"}
          component={EndOfServiceCalculator}
        />
        <Route path={"/tools/leave-calculator"} component={LeaveCalculator} />
        <Route path={"/tools/letter-generator"} component={LetterGenerator} />
  <Route path="/pricing" component={PricingRedesigned} />
  <Route path="/trial-accounts" component={TrialAccounts} />
  <Route path="/trial" component={TrialAccounts} />
        {AIChat && (
          <Route path="/ai/chat" component={AIChat} />
        )}
        {AIAnalytics && (
          <Route path="/ai/analytics" component={AIAnalytics} />
        )}
        {AIPerformanceEvaluator && (
          <Route path="/ai/performance-evaluator" component={AIPerformanceEvaluator} />
        )}
        
        {/* Saudi Regulations & AI Tools Routes */}
        <Route path="/ai" component={AIDashboard} />
        <Route path="/ai/dashboard" component={AIDashboard} />
        <Route path="/regulations" component={SaudiRegulations} />
        <Route path="/regulations/:id" component={SaudiRegulations} />
        <Route path="/calculators" component={FinancialCalculators} />
        <Route path="/ai/regulations" component={SaudiRegulations} />
        <Route path="/ai/calculators" component={FinancialCalculators} />
        
        <Route
          path="/dashboard"
          component={DashboardRedirect}
        />
        <Route
          path="/company/dashboard"
          component={ProtectedCompanyDashboard}
        />
        <Route
          path="/company/dashboard-enhanced"
          component={ProtectedEnhancedCompanyDashboard}
        />
        <Route
          path="/admin/dashboard"
          component={ProtectedAdminDashboard}
        />
        <Route
          path="/admin/dashboard-enhanced"
          component={ProtectedEnhancedAdminDashboard}
        />
        <Route
          path="/admin/users"
          component={ProtectedAdminUsers}
        />
        <Route
          path="/admin/subscriptions"
          component={ProtectedAdminSubscriptions}
        />
        <Route
          path="/admin/bookings"
          component={ProtectedAdminBookings}
        />
        <Route
          path="/admin/audit-logs"
          component={ProtectedAdminAuditLogs}
        />
        <Route
          path="/admin/chat"
          component={ProtectedAdminChat}
        />
        <Route
          path="/dashboard/employees"
          component={ProtectedEmployees}
        />
        <Route
          path="/dashboard/ats"
          component={ProtectedAtsManagement}
        />
        <Route
          path="/dashboard/tickets"
          component={ProtectedTickets}
        />
        <Route
          path="/dashboard/tasks"
          component={ProtectedTasks}
        />
        <Route
          path="/dashboard/reports"
          component={ProtectedReports}
        />
        <Route
          path="/dashboard/executive"
          component={ProtectedExecutiveDashboard}
        />
        <Route
          path="/dashboard/settings"
          component={ProtectedSettings}
        />
        <Route
          path="/dashboard/certificates"
          component={ProtectedCertificates}
        />
        <Route
          path="/dashboard/legal-check"
          component={ProtectedLegalCheck}
        />
        <Route
          path="/dashboard/templates"
          component={ProtectedTemplates}
        />
        <Route
          path="/dashboard/smart-form-generator"
          component={ProtectedTemplates}
        />
        <Route
          path="/dashboard/reminders"
          component={ProtectedReminders}
        />
        <Route
          path="/dashboard/tools"
          component={ProtectedDashboardTools}
        />
        <Route
          path="/dashboard/notifications"
          component={ProtectedNotifications}
        />
        {/* New Feature Routes */}
        <Route
          path="/dashboard/analytics"
          component={ProtectedAnalyticsPage}
        />
        <Route
          path="/dashboard/training"
          component={ProtectedTrainingPage}
        />
        <Route
          path="/dashboard/interviews"
          component={ProtectedInterviewsPage}
        />
        <Route
          path="/dashboard/performance"
          component={ProtectedPerformancePage}
        />
        <Route
          path="/dashboard/messaging"
          component={ProtectedMessagingPage}
        />
        <Route
          path="/dashboard/reports-export"
          component={ProtectedReportsPage}
        />
        <Route path="/verify-decision" component={VerifyDecision} />
        <Route path="/services" component={Services} />
        <Route path="/brand-preview" component={BrandPreview} />
        {ComponentShowcase && (
          <Route path="/dev/showcase" component={ComponentShowcase} />
        )}
        <Route path={"/404"} component={NotFoundRedesigned} />
        {/* Final fallback route */}
        <Route component={NotFoundRedesigned} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Log app initialization
  useEffect(() => {
    console.log(`[Rabit] App component mounted (v${APP_VERSION})`);
    return () => console.log(`[Rabit] App component unmounted`);
  }, []);

  // Initialize Analytics (GA4)
  useAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);
  usePageTracking();

  // Track Core Web Vitals
  useWebVitals({
    enableLogging: process.env.NODE_ENV === "development",
    reportCallback: (metric) => {
      // In production, send to analytics service
      if (process.env.NODE_ENV === "production") {
        // Send metrics to console for now - integrate with analytics service when ready
         
        console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(0)}`);
      }
    },
  });

  // Register Service Worker for PWA support
  useServiceWorker();

  // Accessibility enhancements
  useFocusVisible();
  useARIAEnhancer();
  useARIAValidation();

  console.log(`[Rabit] App rendering...`);

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <TooltipProvider>
            <SkipLink />
            <HeaderRedesigned />
            <main
              id="main-content"
              className="min-h-[calc(100vh-4rem)]"
              tabIndex={-1}
            >
              <Toaster />
              <Router />
              <RouteAnnouncer />
            </main>
            <ChatWidget />
            <CookieConsent />
            <KeyboardShortcuts />
            
            {/* AI Assistant - Floating Button */}
            <AIAssistant />
            
            {/* PWA Components */}
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            <OfflineIndicator />
          </TooltipProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
