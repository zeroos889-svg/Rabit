import DashboardLayout from "@/components/DashboardLayout";
import { InternalMessaging } from "@/components/messaging/InternalMessaging";

export default function MessagingPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        {/* Internal Messaging Component - Full Height */}
        <InternalMessaging />
      </div>
    </DashboardLayout>
  );
}
