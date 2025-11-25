/**
 * Vercel Serverless Function Entry Point
 * This file serves as the main API handler for Vercel deployment
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple health check for now - full server initialization is complex for serverless
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // For now, return a simple response
    // TODO: Initialize minimal Express app for API routes
    if (req.url === '/api/health' || req.url === '/api') {
      return res.status(200).json({
        status: 'ok',
        message: 'Rabit API is running on Vercel',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
      });
    }

    // For other routes, return not implemented yet
    return res.status(501).json({
      error: 'Not Implemented',
      message: 'API routes are being migrated to serverless',
      url: req.url
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
