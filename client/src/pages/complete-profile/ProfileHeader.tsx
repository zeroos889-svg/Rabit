interface ProfileHeaderProps {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  isArabic: boolean;
}

export function ProfileHeader({ icon, title, accentColor, isArabic }: Readonly<ProfileHeaderProps>) {
  const description = isArabic
    ? "أضف المزيد من المعلومات لتحسين ملفك الشخصي"
    : "Add more information to enhance your profile";

  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${accentColor} rounded-2xl mb-4 shadow-lg`}>
        {icon}
      </div>
      <h1 className="text-3xl font-bold mb-2">
        <span className={`bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
          {title}
        </span>
      </h1>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function HelpText({ isArabic }: Readonly<{ isArabic: boolean }>) {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-500">
        {isArabic
          ? "يمكنك تعديل هذه المعلومات لاحقاً من إعدادات الحساب"
          : "You can edit this information later from account settings"}
      </p>
    </div>
  );
}
