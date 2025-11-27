/**
 * WebSocket Real-time Communication System
 * نظام الاتصال الفوري عبر WebSocket
 * 
 * Provides comprehensive WebSocket functionality for real-time features
 * including notifications, live updates, presence detection, and room management.
 * 
 * يوفر وظائف WebSocket شاملة للمميزات الفورية
 * بما في ذلك الإشعارات، التحديثات المباشرة، كشف الحضور، وإدارة الغرف.
 * 
 * Features / المميزات:
 * - Real-time notifications delivery
 * - Live dashboard updates
 * - User presence detection
 * - Room-based communication
 * - Authentication & authorization
 * - Connection state management
 * - Automatic reconnection handling
 * - Integration with metrics and logging
 * 
 * @module WebSocket
 */

import { Server as HTTPServer } from "node:http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { COOKIE_NAME } from "@shared/const";
import { logger } from "./logger";
import {
  setActiveWebSocketConnections,
  trackWebSocketMessage,
} from "./metrics";
import { verifySessionToken } from "./jwt";
import { verifyToken as verifyLegacyToken } from "../utils/jwt";
import * as db from "../db";

// ============================================================================
// Types and Interfaces / الأنواع والواجهات
// ============================================================================

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  userName?: string;
}

interface UserPresence {
  userId: number;
  userName: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen: Date;
  socketId: string;
}

interface RoomInfo {
  name: string;
  members: Set<string>; // socket IDs
  createdAt: Date;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

interface LiveUpdatePayload {
  type: string;
  entity: string;
  action: "create" | "update" | "delete";
  data: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// Configuration / الإعدادات
// ============================================================================

const config = {
  enabled: process.env.WEBSOCKET_ENABLED === "true",
  cors: {
    origin: process.env.APP_URL || "http://localhost:5173",
    credentials: true,
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  maxConnections: 10000,
  path: "/socket.io",
};

// ============================================================================
// State Management / إدارة الحالة
// ============================================================================

let io: SocketIOServer | null = null;
const connectedUsers = new Map<number, Set<string>>(); // userId -> Set of socket IDs
const userPresence = new Map<number, UserPresence>(); // userId -> presence info
const rooms = new Map<string, RoomInfo>(); // roomName -> room info

// ============================================================================
// Initialization / التهيئة
// ============================================================================

/**
 * Initialize WebSocket server
 * تهيئة خادم WebSocket
 */
export function initializeWebSocket(server: HTTPServer): void {
  if (!config.enabled) {
    logger.info("🔌 WebSocket: Disabled (set WEBSOCKET_ENABLED=true to enable)");
    return;
  }

  try {
    io = new SocketIOServer(server, {
      cors: config.cors,
      pingTimeout: config.pingTimeout,
      pingInterval: config.pingInterval,
      path: config.path,
      transports: ["websocket", "polling"],
    });

    setupEventHandlers();
    setupRoomManagement();

    logger.info("🔌 WebSocket: Initialized successfully");
    logger.info(`🔌 WebSocket: Path: ${config.path}`);
    logger.info(`🔌 WebSocket: CORS Origin: ${config.cors.origin}`);
  } catch (error) {
    logger.error("🔌 WebSocket: Initialization failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Event Handlers / معالجات الأحداث
// ============================================================================

/**
 * Setup WebSocket event handlers
 * إعداد معالجات أحداث WebSocket
 */
function setupEventHandlers(): void {
  if (!io) return;

  io.on("connection", async (socket: AuthenticatedSocket) => {
    logger.debug("🔌 WebSocket: New connection attempt", {
      socketId: socket.id,
      transport: socket.conn.transport.name,
    });

    // Authentication middleware
    const authenticated = await authenticateSocket(socket);
    if (!authenticated) {
      logger.warn("🔌 WebSocket: Unauthorized connection attempt", {
        socketId: socket.id,
      });
      socket.disconnect(true);
      return;
    }

    // Track connection
    trackConnection(socket);

    // Setup event listeners
    setupSocketListeners(socket);

    // Send welcome message
    socket.emit("connected", {
      message: "Connected to RabitHR WebSocket server",
      socketId: socket.id,
      timestamp: new Date(),
    });

    logger.info("🔌 WebSocket: Client connected", {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  io.on("error", (error: Error) => {
    logger.error("🔌 WebSocket: Server error", {
      error: error.message,
    });
  });
}

/**
 * Extract cookie value from handshake header without extra deps
 */
function getCookieValue(header: string | string[] | undefined, key: string): string | null {
  if (!header) return null;
  const raw = Array.isArray(header) ? header.join("; ") : header;

  for (const chunk of raw.split(";")) {
    const part = chunk.trim();
    if (!part) continue;
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const cookieKey = part.substring(0, separatorIndex).trim();
    if (cookieKey !== key) continue;

    return part.substring(separatorIndex + 1);
  }

  return null;
}

/**
 * Authenticate socket connection
 * مصادقة اتصال Socket
 */
async function authenticateSocket(socket: AuthenticatedSocket): Promise<boolean> {
  try {
    const bearerHeader = socket.handshake.headers.authorization;
    const bearer = bearerHeader?.startsWith("Bearer ")
      ? bearerHeader.substring(7)
      : undefined;

    const tokensToTry = ([
      typeof socket.handshake.auth?.token === "string"
        ? socket.handshake.auth.token
        : undefined,
      bearer,
      getCookieValue(socket.handshake.headers.cookie, COOKIE_NAME),
    ].filter(Boolean) as string[]);

    for (const token of tokensToTry) {
      const user = await resolveUserFromToken(token);
      if (user) {
        socket.userId = user.id;
        socket.userRole = user.role ?? undefined;
        socket.userName = user.name ?? undefined;
        return true;
      }
    }

    logger.warn("🔌 WebSocket: Authentication failed", {
      socketId: socket.id,
      providedTokens: tokensToTry.length,
    });
    return false;
  } catch (error) {
    logger.error("🔌 WebSocket: Authentication error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Setup socket event listeners
 * إعداد مستمعي أحداث Socket
 */
function setupSocketListeners(socket: AuthenticatedSocket): void {
  // Presence updates
  socket.on("presence:update", (status: UserPresence["status"]) => {
    updateUserPresence(socket, status);
  });

  // Room operations
  socket.on("room:join", (roomName: string) => {
    joinRoom(socket, roomName);
  });

  socket.on("room:leave", (roomName: string) => {
    leaveRoom(socket, roomName);
  });

  socket.on("room:message", (data: { room: string; message: unknown }) => {
    sendRoomMessage(socket, data.room, data.message);
  });

  // Ping/Pong for connection health
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date() });
  });

  // Disconnect handler
  socket.on("disconnect", (reason: string) => {
    handleDisconnect(socket, reason);
  });

  // Error handler
  socket.on("error", (error: Error) => {
    logger.error("🔌 WebSocket: Socket error", {
      socketId: socket.id,
      userId: socket.userId,
      error: error.message,
    });
  });
}

// ============================================================================
// Connection Management / إدارة الاتصالات
// ============================================================================

/**
 * Track new connection
 * تتبع اتصال جديد
 */
function trackConnection(socket: AuthenticatedSocket): void {
  if (!socket.userId) return;

  let sockets = connectedUsers.get(socket.userId);
  if (!sockets) {
    sockets = new Set<string>();
    connectedUsers.set(socket.userId, sockets);
  }
  sockets.add(socket.id);

  // Update presence
  updateUserPresence(socket, "online");

  // Update metrics
  updateConnectionMetrics();
}

/**
 * Handle socket disconnection
 * معالجة قطع اتصال Socket
 */
function handleDisconnect(socket: AuthenticatedSocket, reason: string): void {
  logger.info("🔌 WebSocket: Client disconnected", {
    socketId: socket.id,
    userId: socket.userId,
    reason,
  });

  if (!socket.userId) return;

  // Remove from connected users
  const userSockets = connectedUsers.get(socket.userId);
  if (userSockets) {
    userSockets.delete(socket.id);
    if (userSockets.size === 0) {
      connectedUsers.delete(socket.userId);
      updateUserPresence(socket, "offline");
    }
  }

  // Leave all rooms
  const socketRooms = Array.from(socket.rooms);
  for (const room of socketRooms) {
    if (room !== socket.id) {
      leaveRoom(socket, room);
    }
  }

  // Update metrics
  updateConnectionMetrics();
}

// ============================================================================
// Presence Management / إدارة الحضور
// ============================================================================

/**
 * Update user presence status
 * تحديث حالة حضور المستخدم
 */
function updateUserPresence(socket: AuthenticatedSocket, status: UserPresence["status"]): void {
  if (!socket.userId) return;

  const presence: UserPresence = {
    userId: socket.userId,
    userName: socket.userName || "Unknown",
    status,
    lastSeen: new Date(),
    socketId: socket.id,
  };

  userPresence.set(socket.userId, presence);

  // Broadcast presence update to relevant users
  socket.broadcast.emit("presence:updated", {
    userId: socket.userId,
    status,
    timestamp: presence.lastSeen,
  });

  logger.debug("🔌 WebSocket: Presence updated", {
    userId: socket.userId,
    status,
  });
}

/**
 * Get user presence
 * الحصول على حالة حضور المستخدم
 */
export function getUserPresence(userId: number): UserPresence | null {
  return userPresence.get(userId) || null;
}

/**
 * Get all online users
 * الحصول على جميع المستخدمين المتصلين
 */
export function getOnlineUsers(): UserPresence[] {
  return Array.from(userPresence.values()).filter(p => p.status !== "offline");
}

// ============================================================================
// Room Management / إدارة الغرف
// ============================================================================

/**
 * Setup room management
 * إعداد إدارة الغرف
 */
function setupRoomManagement(): void {
  // Predefined rooms can be created here
  createRoom("notifications");
  createRoom("dashboard");
  createRoom("admin");
}

/**
 * Create a room
 * إنشاء غرفة
 */
function createRoom(roomName: string): void {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, {
      name: roomName,
      members: new Set(),
      createdAt: new Date(),
    });
    logger.debug("🔌 WebSocket: Room created", { room: roomName });
  }
}

/**
 * Join a room
 * الانضمام لغرفة
 */
function joinRoom(socket: AuthenticatedSocket, roomName: string): void {
  if (!socket.userId) return;

  // Create room if it doesn't exist
  if (!rooms.has(roomName)) {
    createRoom(roomName);
  }

  const room = rooms.get(roomName);
  if (!room) {
    logger.error("🔌 WebSocket: Failed to create room", { roomName });
    return;
  }

  // Join the room
  socket.join(roomName);
  room.members.add(socket.id);

  // Notify room members
  socket.to(roomName).emit("room:member_joined", {
    userId: socket.userId,
    userName: socket.userName,
    room: roomName,
    timestamp: new Date(),
  });

  logger.debug("🔌 WebSocket: User joined room", {
    userId: socket.userId,
    room: roomName,
  });

  // Update metrics
  setActiveWebSocketConnections(room.members.size, roomName);
}

/**
 * Leave a room
 * مغادرة غرفة
 */
function leaveRoom(socket: AuthenticatedSocket, roomName: string): void {
  if (!socket.userId) return;

  const room = rooms.get(roomName);
  if (!room) return;

  socket.leave(roomName);
  room.members.delete(socket.id);

  // Notify room members
  socket.to(roomName).emit("room:member_left", {
    userId: socket.userId,
    userName: socket.userName,
    room: roomName,
    timestamp: new Date(),
  });

  logger.debug("🔌 WebSocket: User left room", {
    userId: socket.userId,
    room: roomName,
  });

  // Update metrics
  setActiveWebSocketConnections(room.members.size, roomName);
}

/**
 * Send message to room
 * إرسال رسالة لغرفة
 */
function sendRoomMessage(socket: AuthenticatedSocket, roomName: string, message: unknown): void {
  if (!socket.userId) return;

  const room = rooms.get(roomName);
  if (!room?.members.has(socket.id)) {
    logger.warn("🔌 WebSocket: User not in room", {
      userId: socket.userId,
      room: roomName,
    });
    return;
  }

  const payload = {
    userId: socket.userId,
    userName: socket.userName,
    message,
    room: roomName,
    timestamp: new Date(),
  };

  // Send to room (excluding sender)
  socket.to(roomName).emit("room:message", payload);

  // Track metrics
  trackWebSocketMessage("room_message", roomName);

  logger.debug("🔌 WebSocket: Room message sent", {
    userId: socket.userId,
    room: roomName,
  });
}

/**
 * Get room members
 * الحصول على أعضاء الغرفة
 */
export function getRoomMembers(roomName: string): string[] {
  const room = rooms.get(roomName);
  return room ? Array.from(room.members) : [];
}

// ============================================================================
// Broadcasting / البث
// ============================================================================

/**
 * Send notification to user
 * إرسال إشعار لمستخدم
 */
export function sendNotificationToUser(userId: number, notification: NotificationPayload): void {
  if (!io || !config.enabled) return;

  const userSockets = connectedUsers.get(userId);
  if (!userSockets || userSockets.size === 0) {
    logger.debug("🔌 WebSocket: User not connected, notification not sent", {
      userId,
    });
    return;
  }

  for (const socketId of userSockets) {
    io.to(socketId).emit("notification", notification);
  }

  trackWebSocketMessage("notification", "direct");

  logger.debug("🔌 WebSocket: Notification sent to user", {
    userId,
    notificationId: notification.id,
  });
}

/**
 * Send notification to multiple users
 * إرسال إشعار لعدة مستخدمين
 */
export function sendNotificationToUsers(userIds: number[], notification: NotificationPayload): void {
  for (const userId of userIds) {
    sendNotificationToUser(userId, notification);
  }
}

/**
 * Broadcast notification to all connected users
 * بث إشعار لجميع المستخدمين المتصلين
 */
export function broadcastNotification(notification: NotificationPayload): void {
  if (!io || !config.enabled) return;

  io.emit("notification", notification);
  trackWebSocketMessage("notification", "broadcast");

  logger.debug("🔌 WebSocket: Notification broadcasted", {
    notificationId: notification.id,
  });
}

/**
 * Send live update to room
 * إرسال تحديث مباشر لغرفة
 */
export function sendLiveUpdate(roomName: string, update: LiveUpdatePayload): void {
  if (!io || !config.enabled) return;

  io.to(roomName).emit("live:update", update);
  trackWebSocketMessage("live_update", roomName);

  logger.debug("🔌 WebSocket: Live update sent", {
    room: roomName,
    type: update.type,
    entity: update.entity,
    action: update.action,
  });
}

/**
 * Broadcast live update to all users
 * بث تحديث مباشر لجميع المستخدمين
 */
export function broadcastLiveUpdate(update: LiveUpdatePayload): void {
  if (!io || !config.enabled) return;

  io.emit("live:update", update);
  trackWebSocketMessage("live_update", "broadcast");

  logger.debug("🔌 WebSocket: Live update broadcasted", {
    type: update.type,
    entity: update.entity,
    action: update.action,
  });
}

// ============================================================================
// Metrics and Monitoring / المقاييس والمراقبة
// ============================================================================

/**
 * Update connection metrics
 * تحديث مقاييس الاتصالات
 */
function updateConnectionMetrics(): void {
  const totalConnections = Array.from(connectedUsers.values()).reduce(
    (sum, sockets) => sum + sockets.size,
    0
  );

  setActiveWebSocketConnections(totalConnections);

  // Update per-room metrics
  for (const [roomName, room] of rooms.entries()) {
    setActiveWebSocketConnections(room.members.size, roomName);
  }
}

/**
 * Get WebSocket statistics
 * الحصول على إحصائيات WebSocket
 */
export function getWebSocketStats() {
  const totalConnections = Array.from(connectedUsers.values()).reduce(
    (sum, sockets) => sum + sockets.size,
    0
  );

  return {
    enabled: config.enabled,
    totalConnections,
    uniqueUsers: connectedUsers.size,
    onlineUsers: getOnlineUsers().length,
    totalRooms: rooms.size,
    roomStats: Array.from(rooms.entries()).map(([name, room]) => ({
      name,
      members: room.members.size,
      createdAt: room.createdAt,
    })),
  };
}

/**
 * Log WebSocket configuration
 * تسجيل إعدادات WebSocket
 */
export function logWebSocketConfig(): void {
  logger.info("🔌 ============================================");
  logger.info("🔌 WebSocket Configuration");
  logger.info("🔌 ============================================");
  logger.info(`🔌 Enabled: ${config.enabled}`);
  logger.info(`🔌 Path: ${config.path}`);
  logger.info(`🔌 CORS Origin: ${config.cors.origin}`);
  logger.info(`🔌 Ping Timeout: ${config.pingTimeout}ms`);
  logger.info(`🔌 Ping Interval: ${config.pingInterval}ms`);
  logger.info(`🔌 Max Connections: ${config.maxConnections}`);
  logger.info("🔌 ============================================");
}

// ============================================================================
// Graceful Shutdown / الإغلاق الكريم
// ============================================================================

/**
 * Shutdown WebSocket server
 * إغلاق خادم WebSocket
 */
export async function shutdownWebSocket(): Promise<void> {
  if (!io) {
    return;
  }

  try {
    logger.info("🔌 WebSocket: Shutting down...");

    // Notify all clients
    io.emit("server:shutdown", {
      message: "Server is shutting down",
      timestamp: new Date(),
    });

    // Close all connections
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      socket.disconnect(true);
    }

    // Close server
    io.close();

    // Clear state
    connectedUsers.clear();
    userPresence.clear();
    rooms.clear();

    logger.info("🔌 WebSocket: Shutdown complete");
  } catch (error) {
    logger.error("🔌 WebSocket: Shutdown error", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Helper Functions / دوال مساعدة
// ============================================================================

/**
 * Resolve user from any supported token
 */
async function resolveUserFromToken(token: string) {
  try {
    const sessionPayload = await verifySessionToken(token);
    const fallbackPayload = sessionPayload ?? verifyLegacyToken(token);
    if (!fallbackPayload?.userId) {
      return null;
    }

    const user = await db.getUserById(fallbackPayload.userId);
    return user ?? null;
  } catch (error) {
    logger.error("🔌 WebSocket: Token verification error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Check if user is online
 * التحقق من اتصال المستخدم
 */
export function isUserOnline(userId: number): boolean {
  return connectedUsers.has(userId);
}

/**
 * Get user socket IDs
 * الحصول على معرفات Socket للمستخدم
 */
export function getUserSockets(userId: number): string[] {
  const sockets = connectedUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
}

/**
 * Disconnect user
 * قطع اتصال مستخدم
 */
export function disconnectUser(userId: number, reason?: string): void {
  if (!io) return;

  const userSockets = connectedUsers.get(userId);
  if (!userSockets) return;

  for (const socketId of userSockets) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
      logger.info("🔌 WebSocket: User disconnected", {
        userId,
        socketId,
        reason: reason || "Manual disconnect",
      });
    }
  }
}

/**
 * Get WebSocket server instance
 * الحصول على نسخة خادم WebSocket
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}
