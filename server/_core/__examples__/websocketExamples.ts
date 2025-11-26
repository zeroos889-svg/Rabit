/**
 * WebSocket Usage Examples
 * أمثلة استخدام WebSocket
 * 
 * Demonstrates how to use WebSocket functionality in tRPC procedures
 * for real-time notifications, live updates, presence detection, and more.
 * 
 * يوضح كيفية استخدام وظائف WebSocket في إجراءات tRPC
 * للإشعارات الفورية، التحديثات المباشرة، كشف الحضور، والمزيد.
 * 
 * @module WebSocketExamples
 */

import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  sendNotificationToUser,
  sendNotificationToUsers,
  broadcastNotification,
  sendLiveUpdate,
  getUserPresence,
  getOnlineUsers,
  isUserOnline,
  getWebSocketStats,
  disconnectUser,
} from "../websocket";

// ============================================================================
// Example 1: Real-time Notifications
// مثال 1: الإشعارات الفورية
// ============================================================================

/**
 * Send notification to specific user
 * إرسال إشعار لمستخدم محدد
 * 
 * Use case: Alert user about important events
 * حالة الاستخدام: تنبيه المستخدم حول أحداث مهمة
 */
export const sendUserNotification = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      data: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      timestamp: new Date(),
    };

    // Send notification via WebSocket
    sendNotificationToUser(input.userId, notification);

    // Also save to database for offline users
    // NOTE: Implement database persistence in production

    return {
      success: true,
      notificationId: notification.id,
      sentAt: notification.timestamp,
    };
  });

/**
 * Broadcast notification to all users
 * بث إشعار لجميع المستخدمين
 * 
 * Use case: System-wide announcements
 * حالة الاستخدام: إعلانات على مستوى النظام
 */
export const broadcastSystemNotification = publicProcedure
  .input(
    z.object({
      type: z.enum(["info", "warning", "error", "success"]),
      title: z.string(),
      message: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const notification = {
      id: `system-${Date.now()}`,
      type: input.type,
      title: input.title,
      message: input.message,
      timestamp: new Date(),
    };

    // Broadcast to all connected users
    broadcastNotification(notification);

    return {
      success: true,
      notificationId: notification.id,
      broadcastedAt: notification.timestamp,
    };
  });

// ============================================================================
// Example 2: Live Attendance Updates
// مثال 2: تحديثات الحضور المباشرة
// ============================================================================

/**
 * Push attendance update to dashboard
 * دفع تحديث الحضور للوحة التحكم
 * 
 * Use case: Real-time attendance tracking on dashboard
 * حالة الاستخدام: تتبع الحضور الفوري على لوحة التحكم
 */
export const recordAttendanceWithLiveUpdate = publicProcedure
  .input(
    z.object({
      employeeId: z.number(),
      type: z.enum(["check_in", "check_out"]),
      timestamp: z.date(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Save attendance to database
    const attendance = {
      id: Math.floor(Math.random() * 10000),
      employeeId: input.employeeId,
      type: input.type,
      timestamp: input.timestamp,
      location: input.location,
    };

    // NOTE: Implement database persistence in production

    // Send live update to dashboard room
    sendLiveUpdate("dashboard", {
      type: "attendance",
      entity: "Attendance",
      action: "create",
      data: attendance,
      timestamp: new Date(),
    });

    // Also notify relevant managers
    const managerIds = [1, 2]; // NOTE: Replace with actual manager lookup from database
    sendNotificationToUsers(managerIds, {
      id: `attendance-${attendance.id}`,
      type: "attendance",
      title: "New Attendance Record",
      message: `Employee ${input.employeeId} ${input.type === "check_in" ? "checked in" : "checked out"}`,
      data: attendance,
      timestamp: new Date(),
    });

    return {
      success: true,
      attendance,
    };
  });

// ============================================================================
// Example 3: User Presence Detection
// مثال 3: كشف حضور المستخدم
// ============================================================================

/**
 * Check if user is online
 * التحقق من اتصال المستخدم
 * 
 * Use case: Show online status in chat or collaboration features
 * حالة الاستخدام: عرض حالة الاتصال في الدردشة أو مميزات التعاون
 */
export const checkUserPresence = publicProcedure
  .input(
    z.object({
      userId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const isOnline = isUserOnline(input.userId);
    const presence = getUserPresence(input.userId);

    return {
      userId: input.userId,
      isOnline,
      presence,
    };
  });

/**
 * Get all online users
 * الحصول على جميع المستخدمين المتصلين
 * 
 * Use case: Display online team members
 * حالة الاستخدام: عرض أعضاء الفريق المتصلين
 */
export const getOnlineTeamMembers = publicProcedure
  .query(async () => {
    const onlineUsers = getOnlineUsers();

    return {
      count: onlineUsers.length,
      users: onlineUsers.map(user => ({
        userId: user.userId,
        userName: user.userName,
        status: user.status,
        lastSeen: user.lastSeen,
      })),
    };
  });

// ============================================================================
// Example 4: Live Document Collaboration
// مثال 4: التعاون المباشر على المستندات
// ============================================================================

/**
 * Update document with live sync
 * تحديث مستند مع المزامنة المباشرة
 * 
 * Use case: Real-time document editing like Google Docs
 * حالة الاستخدام: تحرير مستندات فوري مثل Google Docs
 */
export const updateDocumentWithSync = publicProcedure
  .input(
    z.object({
      documentId: z.string(),
      userId: z.number(),
      changes: z.array(
        z.object({
          type: z.enum(["insert", "delete", "update"]),
          position: z.number(),
          content: z.string().optional(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    // Save changes to database
    // NOTE: Implement database persistence in production

    // Broadcast changes to all users in document room
    const roomName = `document:${input.documentId}`;
    sendLiveUpdate(roomName, {
      type: "document",
      entity: "DocumentChanges",
      action: "update",
      data: {
        documentId: input.documentId,
        userId: input.userId,
        changes: input.changes,
      },
      timestamp: new Date(),
    });

    return {
      success: true,
      documentId: input.documentId,
      syncedAt: new Date(),
    };
  });

// ============================================================================
// Example 5: Leave Request Notifications
// مثال 5: إشعارات طلبات الإجازة
// ============================================================================

/**
 * Submit leave request with notifications
 * تقديم طلب إجازة مع الإشعارات
 * 
 * Use case: Notify managers instantly when employee requests leave
 * حالة الاستخدام: إشعار المدراء فوراً عند طلب موظف إجازة
 */
export const submitLeaveRequest = publicProcedure
  .input(
    z.object({
      employeeId: z.number(),
      startDate: z.date(),
      endDate: z.date(),
      type: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // Save leave request to database
    const leaveRequest = {
      id: Math.floor(Math.random() * 10000),
      ...input,
      status: "pending",
      submittedAt: new Date(),
    };

    // NOTE: Implement database persistence in production

    // Get employee's manager
    const managerId = 1; // NOTE: Replace with actual manager lookup from database

    // Send notification to manager
    sendNotificationToUser(managerId, {
      id: `leave-${leaveRequest.id}`,
      type: "leave_request",
      title: "New Leave Request",
      message: `Employee ${input.employeeId} requested leave from ${input.startDate.toLocaleDateString()} to ${input.endDate.toLocaleDateString()}`,
      data: leaveRequest,
      timestamp: new Date(),
    });

    // Update live dashboard
    sendLiveUpdate("dashboard", {
      type: "leave_request",
      entity: "LeaveRequest",
      action: "create",
      data: leaveRequest,
      timestamp: new Date(),
    });

    return {
      success: true,
      leaveRequest,
    };
  });

/**
 * Approve/reject leave request with notifications
 * الموافقة/رفض طلب إجازة مع الإشعارات
 * 
 * Use case: Instantly notify employee about leave decision
 * حالة الاستخدام: إشعار الموظف فوراً بقرار الإجازة
 */
export const updateLeaveRequest = publicProcedure
  .input(
    z.object({
      requestId: z.number(),
      status: z.enum(["approved", "rejected"]),
      comment: z.string().optional(),
      managerId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Update leave request in database
    const leaveRequest = {
      id: input.requestId,
      status: input.status,
      comment: input.comment,
      reviewedBy: input.managerId,
      reviewedAt: new Date(),
    };

    // NOTE: Implement database persistence in production
    const employeeId = 1; // NOTE: Replace with actual employee lookup from database

    // Notify employee
    sendNotificationToUser(employeeId, {
      id: `leave-update-${leaveRequest.id}`,
      type: "leave_decision",
      title: `Leave Request ${input.status === "approved" ? "Approved" : "Rejected"}`,
      message: input.status === "approved" 
        ? "Your leave request has been approved!"
        : "Your leave request has been rejected.",
      data: leaveRequest,
      timestamp: new Date(),
    });

    // Update live dashboard
    sendLiveUpdate("dashboard", {
      type: "leave_request",
      entity: "LeaveRequest",
      action: "update",
      data: leaveRequest,
      timestamp: new Date(),
    });

    return {
      success: true,
      leaveRequest,
    };
  });

// ============================================================================
// Example 6: Payroll Processing Notifications
// مثال 6: إشعارات معالجة الرواتب
// ============================================================================

/**
 * Process payroll with notifications
 * معالجة الرواتب مع الإشعارات
 * 
 * Use case: Notify employees when payroll is processed
 * حالة الاستخدام: إشعار الموظفين عند معالجة الرواتب
 */
export const processPayrollWithNotifications = publicProcedure
  .input(
    z.object({
      payPeriod: z.string(),
      employeeIds: z.array(z.number()),
    })
  )
  .mutation(async ({ input }) => {
    // Process payroll
    const payrollResults = input.employeeIds.map(employeeId => ({
      employeeId,
      amount: Math.floor(Math.random() * 10000) + 5000,
      status: "processed",
      processedAt: new Date(),
    }));

    // NOTE: Implement database persistence in production

    // Send notification to each employee
    for (const [index, employeeId] of input.employeeIds.entries()) {
      sendNotificationToUser(employeeId, {
        id: `payroll-${input.payPeriod}-${employeeId}`,
        type: "payroll",
        title: "Payroll Processed",
        message: `Your salary for ${input.payPeriod} has been processed: $${payrollResults[index].amount}`,
        data: payrollResults[index],
        timestamp: new Date(),
      });
    }

    // Update admin dashboard
    sendLiveUpdate("admin", {
      type: "payroll",
      entity: "Payroll",
      action: "create",
      data: {
        payPeriod: input.payPeriod,
        employeeCount: input.employeeIds.length,
        totalAmount: payrollResults.reduce((sum, p) => sum + p.amount, 0),
        processedAt: new Date(),
      },
      timestamp: new Date(),
    });

    return {
      success: true,
      payPeriod: input.payPeriod,
      processed: payrollResults.length,
      results: payrollResults,
    };
  });

// ============================================================================
// Example 7: Chat and Messaging
// مثال 7: الدردشة والرسائل
// ============================================================================

/**
 * Send direct message with live delivery
 * إرسال رسالة مباشرة مع التسليم الفوري
 * 
 * Use case: Internal chat system
 * حالة الاستخدام: نظام دردشة داخلي
 */
export const sendDirectMessage = publicProcedure
  .input(
    z.object({
      senderId: z.number(),
      recipientId: z.number(),
      message: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const message = {
      id: `msg-${Date.now()}`,
      senderId: input.senderId,
      recipientId: input.recipientId,
      message: input.message,
      timestamp: new Date(),
      status: "sent",
    };

    // Save to database
    // NOTE: Implement database persistence in production

    // Send via WebSocket
    sendNotificationToUser(input.recipientId, {
      id: message.id,
      type: "message",
      title: `New message from User ${input.senderId}`,
      message: input.message,
      data: message,
      timestamp: message.timestamp,
    });

    // Update sender's chat interface
    sendLiveUpdate(`chat:${input.senderId}`, {
      type: "message",
      entity: "Message",
      action: "create",
      data: message,
      timestamp: new Date(),
    });

    return {
      success: true,
      message,
    };
  });

// ============================================================================
// Example 8: System Monitoring and Alerts
// مثال 8: مراقبة النظام والتنبيهات
// ============================================================================

/**
 * Send system alert to admins
 * إرسال تنبيه نظام للمدراء
 * 
 * Use case: Critical system events need immediate attention
 * حالة الاستخدام: أحداث نظام حرجة تحتاج انتباه فوري
 */
export const sendSystemAlert = publicProcedure
  .input(
    z.object({
      severity: z.enum(["low", "medium", "high", "critical"]),
      title: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const alert = {
      id: `alert-${Date.now()}`,
      severity: input.severity,
      title: input.title,
      message: input.message,
      details: input.details,
      timestamp: new Date(),
    };

    // Get admin user IDs
    const adminIds = [1, 2, 3]; // NOTE: Replace with actual admin lookup from database

    // Send to all admins
    sendNotificationToUsers(adminIds, {
      id: alert.id,
      type: "system_alert",
      title: `[${input.severity.toUpperCase()}] ${input.title}`,
      message: input.message,
      data: alert,
      timestamp: alert.timestamp,
    });

    // Update admin dashboard
    sendLiveUpdate("admin", {
      type: "system_alert",
      entity: "Alert",
      action: "create",
      data: alert,
      timestamp: new Date(),
    });

    return {
      success: true,
      alert,
    };
  });

// ============================================================================
// Example 9: WebSocket Statistics and Monitoring
// مثال 9: إحصائيات ومراقبة WebSocket
// ============================================================================

/**
 * Get WebSocket statistics
 * الحصول على إحصائيات WebSocket
 * 
 * Use case: Monitor WebSocket health and usage
 * حالة الاستخدام: مراقبة صحة واستخدام WebSocket
 */
export const getWebSocketStatistics = publicProcedure
  .query(async () => {
    const stats = getWebSocketStats();

    return {
      ...stats,
      retrievedAt: new Date(),
    };
  });

// ============================================================================
// Example 10: Force Disconnect User
// مثال 10: فصل مستخدم إجبارياً
// ============================================================================

/**
 * Disconnect user (admin action)
 * فصل مستخدم (إجراء مدير)
 * 
 * Use case: Security or administrative actions
 * حالة الاستخدام: إجراءات أمنية أو إدارية
 */
export const forceDisconnectUser = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // Notify user before disconnect
    sendNotificationToUser(input.userId, {
      id: `disconnect-${Date.now()}`,
      type: "system",
      title: "Connection Terminated",
      message: input.reason,
      timestamp: new Date(),
    });

    // Wait a moment for notification to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Disconnect user
    disconnectUser(input.userId, input.reason);

    return {
      success: true,
      userId: input.userId,
      reason: input.reason,
      disconnectedAt: new Date(),
    };
  });

// ============================================================================
// Router Export
// ============================================================================

export const websocketExamplesRouter = router({
  sendUserNotification,
  broadcastSystemNotification,
  recordAttendanceWithLiveUpdate,
  checkUserPresence,
  getOnlineTeamMembers,
  updateDocumentWithSync,
  submitLeaveRequest,
  updateLeaveRequest,
  processPayrollWithNotifications,
  sendDirectMessage,
  sendSystemAlert,
  getWebSocketStatistics,
  forceDisconnectUser,
});
