/**
 * Example: Using OpenTelemetry Tracing in tRPC Procedures
 * 
 * This file demonstrates how to add custom spans to tRPC procedures
 * for detailed tracing of business logic.
 */

import { createSpan, addSpanAttributes, recordException } from "../openTelemetry";
import { publicProcedure } from "../trpc";
import { z } from "zod";

/**
 * Example 1: Simple span creation
 */
export const exampleSimpleTrace = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    return await createSpan("getUserProfile", async (span) => {
      // Add custom attributes to span
      span.setAttribute("user.id", input.userId);
      
      // Simulate database query
      const user = await simulateDbQuery(input.userId);
      
      span.setAttribute("user.found", user !== null);
      
      return { user };
    });
  });

/**
 * Example 2: Nested spans for complex operations
 */
export const exampleNestedTraces = publicProcedure
  .input(z.object({ orderId: z.string() }))
  .mutation(async ({ input }) => {
    return await createSpan("processOrder", async (parentSpan) => {
      parentSpan.setAttribute("order.id", input.orderId);
      
      // Step 1: Validate order
      const order = await createSpan("validateOrder", async (span) => {
        span.setAttribute("order.id", input.orderId);
        const result = await validateOrder(input.orderId);
        span.setAttribute("order.valid", result.valid);
        return result;
      });
      
      if (!order.valid) {
        parentSpan.setAttribute("order.status", "invalid");
        throw new Error("Invalid order");
      }
      
      // Step 2: Process payment
      const payment = await createSpan("processPayment", async (span) => {
        span.setAttribute("order.id", input.orderId);
        span.setAttribute("payment.amount", order.amount);
        
        try {
          const result = await processPayment(order);
          span.setAttribute("payment.status", result.status);
          return result;
        } catch (error) {
          recordException(error as Error, {
            "payment.error.code": (error as any).code,
          });
          throw error;
        }
      });
      
      // Step 3: Send confirmation
      await createSpan("sendConfirmation", async (span) => {
        span.setAttribute("order.id", input.orderId);
        span.setAttribute("user.email", order.email);
        await sendEmail(order.email, "Order Confirmation");
      });
      
      parentSpan.setAttribute("order.status", "completed");
      return { success: true, orderId: input.orderId, payment };
    });
  });

/**
 * Example 3: Adding attributes without custom span
 * (uses the auto-instrumented span from HTTP/Express)
 */
export const exampleSimpleAttributes = publicProcedure
  .input(z.object({ searchQuery: z.string() }))
  .query(async ({ input }) => {
    // Add attributes to the current span
    addSpanAttributes({
      "search.query": input.searchQuery,
      "search.type": "full-text",
    });
    
    const results = await searchDatabase(input.searchQuery);
    
    addSpanAttributes({
      "search.results.count": results.length,
      "search.completed": true,
    });
    
    return { results };
  });

/**
 * Example 4: Error handling with tracing
 */
export const exampleErrorTrace = publicProcedure
  .input(z.object({ taskId: z.string() }))
  .mutation(async ({ input }) => {
    return await createSpan("executeTask", async (span) => {
      span.setAttribute("task.id", input.taskId);
      
      try {
        const result = await executeTask(input.taskId);
        span.setAttribute("task.status", "success");
        return result;
      } catch (error) {
        // Record exception in span
        recordException(error as Error, {
          "task.id": input.taskId,
          "task.status": "failed",
          "error.recoverable": false,
        });
        
        span.setAttribute("task.failed", true);
        throw error; // Re-throw after recording
      }
    });
  });

// Simulated helper functions
async function simulateDbQuery(userId: string) {
  return { id: userId, name: "Test User" };
}

async function validateOrder(orderId: string) {
  return { valid: true, amount: 1000, email: "user@example.com" };
}

async function processPayment(order: any) {
  return { status: "success", transactionId: "txn_123" };
}

async function sendEmail(email: string, subject: string) {
  // Send email logic
}

async function searchDatabase(query: string) {
  return [{ id: "1", name: "Result 1" }];
}

async function executeTask(taskId: string) {
  return { taskId, status: "completed" };
}
