import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { logger } from "./_core/logger";
import { PaymentSchemas } from "./_core/validation";

type PaymentInput = {
  planKey: string;
  amount: number;
  discountCode?: string;
  customerEmail?: string;
};

function buildMockRedirect(provider: "moyasar" | "tap", input: PaymentInput) {
  const params = new URLSearchParams({
    plan: input.planKey,
    amount: String(input.amount),
  });
  if (input.discountCode) params.set("discount", input.discountCode);
  if (input.customerEmail) params.set("email", input.customerEmail);
  return { redirectUrl: `/payments/${provider}/mock?${params.toString()}` };
}

async function createMoyasarInvoice(input: PaymentInput) {
  if (!ENV.moyasarSecretKey) {
    logger.warn("[Payment] Moyasar secret not set, returning mock redirect");
    return buildMockRedirect("moyasar", input);
  }

  const payload = {
    amount: Math.round(input.amount * 100), // Halalas
    currency: "SAR",
    description: `Plan ${input.planKey}`,
    callback_url: `${ENV.appUrl}/payment/moyasar/callback`,
    metadata: {
      discountCode: input.discountCode,
      customerEmail: input.customerEmail,
    },
  };

  const authString = `${ENV.moyasarSecretKey}:`;
  const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`;

  const response = await fetch("https://api.moyasar.com/v1/invoices", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    logger.error("[Payment] Moyasar invoice creation failed", {
      status: response.status,
      statusText: response.statusText,
      message: msg,
    });
    return buildMockRedirect("moyasar", input);
  }

  const data = (await response.json()) as { url?: string; id?: string };
  if (!data.url) {
    logger.warn("[Payment] Moyasar invoice missing url, falling back to mock", data);
    return buildMockRedirect("moyasar", input);
  }
  return { redirectUrl: data.url, invoiceId: data.id };
}

async function createTapCharge(input: PaymentInput) {
  if (!ENV.tapSecretKey) {
    logger.warn("[Payment] Tap secret not set, returning mock redirect");
    return buildMockRedirect("tap", input);
  }

  const payload = {
    amount: input.amount,
    currency: "SAR",
    description: `Plan ${input.planKey}`,
    customer: input.customerEmail
      ? {
          email: input.customerEmail,
        }
      : undefined,
    redirect: {
      url: `${ENV.appUrl}/payment/tap/callback`,
    },
    metadata: {
      planKey: input.planKey,
      discountCode: input.discountCode,
    },
  };

  const response = await fetch("https://api.tap.company/v2/charges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.tapSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    logger.error("[Payment] Tap charge creation failed", {
      status: response.status,
      statusText: response.statusText,
      message: msg,
    });
    return buildMockRedirect("tap", input);
  }

  const data = (await response.json()) as { transaction?: { url?: string; id?: string } };
  const redirectUrl = data.transaction?.url;
  if (!redirectUrl) {
    logger.warn("[Payment] Tap transaction missing url, falling back to mock", data);
    return buildMockRedirect("tap", input);
  }
  return { redirectUrl, chargeId: data.transaction?.id };
}

// Payment router with validation and graceful fallbacks
export const paymentRouter = router({
  createMoyasarPayment: publicProcedure
    .input(
      z.object({
        planKey: z.string().min(1, "Plan key is required"),
        amount: z.number().positive("Amount must be positive"),
        discountCode: z.string().optional(),
        customerEmail: z.string().email("Invalid email format").optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Additional validation using PaymentSchemas
      const validatedPayment = PaymentSchemas.createPayment.parse({
        amount: input.amount,
        currency: "SAR",
        description: `Plan ${input.planKey}`,
        metadata: {
          planKey: input.planKey,
          discountCode: input.discountCode,
          customerEmail: input.customerEmail,
        },
      });

      logger.info("[Payment] Creating Moyasar payment", {
        context: "Payment",
        planKey: input.planKey,
        amount: validatedPayment.amount,
      });

      return createMoyasarInvoice(input);
    }),

  createTapPayment: publicProcedure
    .input(
      z.object({
        planKey: z.string().min(1, "Plan key is required"),
        amount: z.number().positive("Amount must be positive"),
        discountCode: z.string().optional(),
        customerEmail: z.string().email("Invalid email format").optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Additional validation using PaymentSchemas
      const validatedPayment = PaymentSchemas.createPayment.parse({
        amount: input.amount,
        currency: "SAR",
        description: `Plan ${input.planKey}`,
        metadata: {
          planKey: input.planKey,
          discountCode: input.discountCode,
          customerEmail: input.customerEmail,
        },
      });

      logger.info("[Payment] Creating Tap payment", {
        context: "Payment",
        planKey: input.planKey,
        amount: validatedPayment.amount,
      });

      return createTapCharge(input);
    }),
});
