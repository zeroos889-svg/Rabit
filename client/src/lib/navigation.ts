export const getDashboardPath = (user: any) => {
  const userType = user?.userType;

  if (user?.role === "admin") return "/admin/dashboard";
  if (userType === "company") return "/company/dashboard";
  if (userType === "consultant") return "/consultant-dashboard";
  if (userType === "employee") return "/employee/dashboard";

  return "/dashboard";
};
