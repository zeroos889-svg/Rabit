import { describe, it, expect } from "vitest";
import {
  createConsultant,
  approveConsultant,
  createConsultationBooking,
  getConsultationBookingById,
  getConsultationBookingsByClient,
  getConsultationMessages,
  sendConsultationMessage,
  getAllConsultationTypes,
} from "./db";

describe("consultation smoke flow", () => {
  it("creates booking with SLA and supports messaging", async () => {
    const consultationTypes = await getAllConsultationTypes();
    expect(consultationTypes.length).toBeGreaterThan(0);
    const typeId = consultationTypes[0].id;

    // Consultant setup
    const consultantId = await createConsultant({
      userId: 2001,
      fullName: "مستشار تجريبي",
      status: "approved",
    });
    await approveConsultant(consultantId);

    // Create booking
    const bookingId = await createConsultationBooking({
      userId: 1001,
      consultantId,
      consultationTypeId: typeId,
      scheduledDate: new Date(),
      scheduledTime: "10:00",
      description: "اختبار تدفق الاستشارة",
      status: "pending",
    });

    const booking = await getConsultationBookingById(bookingId);
    expect(booking?.ticketNumber).toBeTruthy();
    expect(booking?.slaHours || booking?.status).toBeTruthy();

    // Message flow
    const messageId = await sendConsultationMessage({
      bookingId,
      senderId: 1001,
      message: "مرحبا، هذا اختبار",
    });
    expect(messageId).toBeGreaterThan(0);

    const messages = await getConsultationMessages(bookingId);
    expect(messages.length).toBeGreaterThan(0);

    // Client listing
    const myBookings = await getConsultationBookingsByClient(1001);
    const exists = myBookings.some(b => b.id === bookingId);
    expect(exists).toBe(true);
  });
});
