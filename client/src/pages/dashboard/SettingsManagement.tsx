import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  Building2,
  Shield,
  Lock,
  Bell,
  Globe,
  Palette,
  Mail,
  Phone,
  MapPin,
  Save,
  Key,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsManagement() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Account Settings State
  const [accountData, setAccountData] = useState({
    name: "أحمد محمد السعيد",
    email: "ahmed.alsaeed@rabithr.com",
    phone: "+966501234567",
    position: "مدير الموارد البشرية",
    avatar: "",
  });

  // Company Settings State
  const [companyData, setCompanyData] = useState({
    name: "شركة رابِط للموارد البشرية",
    industry: "hr-software",
    size: "50-200",
    address: "الرياض، المملكة العربية السعودية",
    website: "https://rabithr.com",
    taxId: "300000000000003",
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: "ar",
    theme: "system",
    timezone: "Asia/Riyadh",
    dateFormat: "DD/MM/YYYY",
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leaveRequests: true,
    newApplicants: true,
    taskReminders: true,
    weeklyReports: false,
  });

  // Security State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
  });

  // Password Dialog State
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveAccount = () => {
    toast.success(
      isArabic
        ? "تم حفظ إعدادات الحساب بنجاح"
        : "Account settings saved successfully"
    );
  };

  const handleSaveCompany = () => {
    toast.success(
      isArabic
        ? "تم حفظ معلومات الشركة بنجاح"
        : "Company information saved successfully"
    );
  };

  const handleSavePreferences = () => {
    toast.success(
      isArabic
        ? "تم حفظ التفضيلات بنجاح"
        : "Preferences saved successfully"
    );
  };

  const handleSaveNotifications = () => {
    toast.success(
      isArabic
        ? "تم حفظ إعدادات الإشعارات بنجاح"
        : "Notification settings saved successfully"
    );
  };

  const handleSaveSecurity = () => {
    toast.success(
      isArabic
        ? "تم حفظ إعدادات الأمان بنجاح"
        : "Security settings saved successfully"
    );
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(
        isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match"
      );
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(
        isArabic
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters"
      );
      return;
    }
    toast.success(
      isArabic ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully"
    );
    setPasswordDialog(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            {isArabic ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isArabic
              ? "إدارة إعدادات الحساب والشركة"
              : "Manage account and company settings"}
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account">
              <User className="w-4 h-4 ml-2" />
              {isArabic ? "الحساب" : "Account"}
            </TabsTrigger>
            <TabsTrigger value="company">
              <Building2 className="w-4 h-4 ml-2" />
              {isArabic ? "الشركة" : "Company"}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Palette className="w-4 h-4 ml-2" />
              {isArabic ? "التفضيلات" : "Preferences"}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 ml-2" />
              {isArabic ? "الإشعارات" : "Notifications"}
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 ml-2" />
              {isArabic ? "الأمان" : "Security"}
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "معلومات الحساب" : "Account Information"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إدارة معلومات حسابك الشخصي"
                    : "Manage your personal account information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {accountData.name.charAt(0)}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      {isArabic ? "تغيير الصورة" : "Change Photo"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      {isArabic
                        ? "JPG, PNG أو GIF. حجم أقصى 2MB"
                        : "JPG, PNG or GIF. Max size 2MB"}
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    {isArabic ? "الاسم الكامل" : "Full Name"}
                  </Label>
                  <Input
                    id="name"
                    value={accountData.name}
                    onChange={(e) =>
                      setAccountData({ ...accountData, name: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {isArabic ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) =>
                      setAccountData({ ...accountData, email: e.target.value })
                    }
                  />
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {isArabic ? "رقم الهاتف" : "Phone Number"}
                  </Label>
                  <Input
                    id="phone"
                    value={accountData.phone}
                    onChange={(e) =>
                      setAccountData({ ...accountData, phone: e.target.value })
                    }
                  />
                </div>

                {/* Position */}
                <div className="grid gap-2">
                  <Label htmlFor="position">
                    {isArabic ? "المسمى الوظيفي" : "Position"}
                  </Label>
                  <Input
                    id="position"
                    value={accountData.position}
                    onChange={(e) =>
                      setAccountData({
                        ...accountData,
                        position: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Password Change */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {isArabic ? "كلمة المرور" : "Password"}
                  </h3>
                  <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Key className="w-4 h-4 ml-2" />
                        {isArabic ? "تغيير كلمة المرور" : "Change Password"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {isArabic ? "تغيير كلمة المرور" : "Change Password"}
                        </DialogTitle>
                        <DialogDescription>
                          {isArabic
                            ? "أدخل كلمة المرور الحالية والجديدة"
                            : "Enter your current and new password"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">
                            {isArabic ? "كلمة المرور الحالية" : "Current Password"}
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              className="absolute left-3 top-1/2 -translate-y-1/2"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  current: !showPasswords.current,
                                })
                              }
                            >
                              {showPasswords.current ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">
                            {isArabic ? "كلمة المرور الجديدة" : "New Password"}
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              className="absolute left-3 top-1/2 -translate-y-1/2"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  new: !showPasswords.new,
                                })
                              }
                            >
                              {showPasswords.new ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">
                            {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              className="absolute left-3 top-1/2 -translate-y-1/2"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  confirm: !showPasswords.confirm,
                                })
                              }
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setPasswordDialog(false)}
                        >
                          {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button onClick={handleChangePassword}>
                          {isArabic ? "تغيير" : "Change"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveAccount} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 ml-2" />
                    {isArabic ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "معلومات الشركة" : "Company Information"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إدارة معلومات شركتك"
                    : "Manage your company information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Name */}
                <div className="grid gap-2">
                  <Label htmlFor="companyName">
                    {isArabic ? "اسم الشركة" : "Company Name"}
                  </Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, name: e.target.value })
                    }
                  />
                </div>

                {/* Industry */}
                <div className="grid gap-2">
                  <Label htmlFor="industry">
                    {isArabic ? "المجال" : "Industry"}
                  </Label>
                  <Select
                    value={companyData.industry}
                    onValueChange={(value) =>
                      setCompanyData({ ...companyData, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr-software">
                        {isArabic ? "برمجيات الموارد البشرية" : "HR Software"}
                      </SelectItem>
                      <SelectItem value="technology">
                        {isArabic ? "تقنية المعلومات" : "Technology"}
                      </SelectItem>
                      <SelectItem value="finance">
                        {isArabic ? "المالية" : "Finance"}
                      </SelectItem>
                      <SelectItem value="healthcare">
                        {isArabic ? "الرعاية الصحية" : "Healthcare"}
                      </SelectItem>
                      <SelectItem value="education">
                        {isArabic ? "التعليم" : "Education"}
                      </SelectItem>
                      <SelectItem value="retail">
                        {isArabic ? "التجزئة" : "Retail"}
                      </SelectItem>
                      <SelectItem value="manufacturing">
                        {isArabic ? "التصنيع" : "Manufacturing"}
                      </SelectItem>
                      <SelectItem value="other">
                        {isArabic ? "أخرى" : "Other"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Size */}
                <div className="grid gap-2">
                  <Label htmlFor="size">
                    {isArabic ? "حجم الشركة" : "Company Size"}
                  </Label>
                  <Select
                    value={companyData.size}
                    onValueChange={(value) =>
                      setCompanyData({ ...companyData, size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">
                        1-10 {isArabic ? "موظفين" : "employees"}
                      </SelectItem>
                      <SelectItem value="11-50">
                        11-50 {isArabic ? "موظف" : "employees"}
                      </SelectItem>
                      <SelectItem value="50-200">
                        50-200 {isArabic ? "موظف" : "employees"}
                      </SelectItem>
                      <SelectItem value="200-500">
                        200-500 {isArabic ? "موظف" : "employees"}
                      </SelectItem>
                      <SelectItem value="500+">
                        500+ {isArabic ? "موظف" : "employees"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="grid gap-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {isArabic ? "العنوان" : "Address"}
                  </Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={companyData.address}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, address: e.target.value })
                    }
                  />
                </div>

                {/* Website */}
                <div className="grid gap-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {isArabic ? "الموقع الإلكتروني" : "Website"}
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyData.website}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, website: e.target.value })
                    }
                  />
                </div>

                {/* Tax ID */}
                <div className="grid gap-2">
                  <Label htmlFor="taxId">
                    {isArabic ? "الرقم الضريبي" : "Tax ID"}
                  </Label>
                  <Input
                    id="taxId"
                    value={companyData.taxId}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, taxId: e.target.value })
                    }
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 ml-2" />
                    {isArabic ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "التفضيلات" : "Preferences"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تخصيص تجربة الاستخدام"
                    : "Customize your experience"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="grid gap-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {isArabic ? "اللغة" : "Language"}
                  </Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="grid gap-2">
                  <Label htmlFor="theme" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {isArabic ? "المظهر" : "Theme"}
                  </Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        {isArabic ? "فاتح" : "Light"}
                      </SelectItem>
                      <SelectItem value="dark">
                        {isArabic ? "داكن" : "Dark"}
                      </SelectItem>
                      <SelectItem value="system">
                        {isArabic ? "تلقائي" : "System"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="grid gap-2">
                  <Label htmlFor="timezone">
                    {isArabic ? "المنطقة الزمنية" : "Timezone"}
                  </Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">
                        {isArabic ? "الرياض (GMT+3)" : "Riyadh (GMT+3)"}
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">
                        {isArabic ? "دبي (GMT+4)" : "Dubai (GMT+4)"}
                      </SelectItem>
                      <SelectItem value="Africa/Cairo">
                        {isArabic ? "القاهرة (GMT+2)" : "Cairo (GMT+2)"}
                      </SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format */}
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">
                    {isArabic ? "صيغة التاريخ" : "Date Format"}
                  </Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, dateFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 ml-2" />
                    {isArabic ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "الإشعارات" : "Notifications"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إدارة تفضيلات الإشعارات"
                    : "Manage your notification preferences"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {isArabic ? "إشعارات البريد الإلكتروني" : "Email Notifications"}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isArabic
                        ? "تلقي إشعارات عبر البريد الإلكتروني"
                        : "Receive notifications via email"}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {isArabic ? "الإشعارات الفورية" : "Push Notifications"}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isArabic
                        ? "تلقي إشعارات فورية على المتصفح"
                        : "Receive instant browser notifications"}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">
                    {isArabic ? "أنواع الإشعارات" : "Notification Types"}
                  </h3>

                  {/* Leave Requests */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">
                        {isArabic ? "طلبات الإجازة" : "Leave Requests"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {isArabic
                          ? "إشعارات عند استلام طلبات إجازة"
                          : "Notifications for new leave requests"}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.leaveRequests}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          leaveRequests: checked,
                        })
                      }
                    />
                  </div>

                  {/* New Applicants */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">
                        {isArabic ? "متقدمين جدد" : "New Applicants"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {isArabic
                          ? "إشعارات عند تقديم طلبات توظيف"
                          : "Notifications for new job applications"}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newApplicants}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          newApplicants: checked,
                        })
                      }
                    />
                  </div>

                  {/* Task Reminders */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">
                        {isArabic ? "تذكير المهام" : "Task Reminders"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {isArabic
                          ? "إشعارات عند اقتراب موعد المهام"
                          : "Reminders for upcoming tasks"}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          taskReminders: checked,
                        })
                      }
                    />
                  </div>

                  {/* Weekly Reports */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {isArabic ? "التقارير الأسبوعية" : "Weekly Reports"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {isArabic
                          ? "تلقي تقرير أسبوعي عن الأداء"
                          : "Receive weekly performance reports"}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          weeklyReports: checked,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 ml-2" />
                    {isArabic ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "الأمان" : "Security"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إدارة إعدادات الأمان والخصوصية"
                    : "Manage security and privacy settings"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      {isArabic ? "المصادقة الثنائية" : "Two-Factor Authentication"}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {isArabic
                        ? "أضف طبقة أمان إضافية لحسابك"
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorAuth: checked })
                    }
                  />
                </div>

                {/* Session Timeout */}
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">
                    {isArabic ? "انتهاء الجلسة (دقائق)" : "Session Timeout (minutes)"}
                  </Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(value) =>
                      setSecurity({ ...security, sessionTimeout: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {isArabic ? "دقيقة" : "minutes"}</SelectItem>
                      <SelectItem value="30">30 {isArabic ? "دقيقة" : "minutes"}</SelectItem>
                      <SelectItem value="60">60 {isArabic ? "دقيقة" : "minutes"}</SelectItem>
                      <SelectItem value="120">120 {isArabic ? "دقيقة" : "minutes"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    {isArabic
                      ? "سيتم تسجيل الخروج تلقائياً بعد فترة عدم النشاط"
                      : "You will be automatically logged out after inactivity"}
                  </p>
                </div>

                {/* Password Expiry */}
                <div className="grid gap-2">
                  <Label htmlFor="passwordExpiry">
                    {isArabic ? "انتهاء صلاحية كلمة المرور (أيام)" : "Password Expiry (days)"}
                  </Label>
                  <Select
                    value={security.passwordExpiry}
                    onValueChange={(value) =>
                      setSecurity({ ...security, passwordExpiry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {isArabic ? "يوم" : "days"}</SelectItem>
                      <SelectItem value="60">60 {isArabic ? "يوم" : "days"}</SelectItem>
                      <SelectItem value="90">90 {isArabic ? "يوم" : "days"}</SelectItem>
                      <SelectItem value="never">
                        {isArabic ? "لا تنتهي" : "Never"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Sessions */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {isArabic ? "الجلسات النشطة" : "Active Sessions"}
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Chrome on Windows</div>
                          <p className="text-sm text-gray-600">
                            192.168.1.100 • {isArabic ? "الرياض، السعودية" : "Riyadh, Saudi Arabia"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isArabic ? "الجلسة الحالية" : "Current session"}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {isArabic ? "نشط" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveSecurity} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 ml-2" />
                    {isArabic ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
