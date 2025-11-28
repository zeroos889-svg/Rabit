 

// Mock backend - returns dummy data for development
export const mockBackend = {
  account: {
    history: () => ({ entries: [] }),
    stats: () => ({ stats: { lastActivity: null, byAction: {} } }),
  },
  auth: {
    me: () => null,
    login: () => ({ success: false, message: 'Backend not connected' }),
    logout: () => ({ success: true }),
  },
  // Add more mock endpoints as needed
};

// Check if backend is available
async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch('/api/trpc', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

let backendAvailable: boolean | null = null;

export async function isBackendAvailable(): Promise<boolean> {
  if (backendAvailable === null) {
    backendAvailable = await checkBackend();
  }
  return backendAvailable;
}

// Show warning if backend is not available
if (globalThis.window !== undefined) {
  const available = await checkBackend();
  if (!available) {
    console.warn(
      '%c⚠️ Backend API not available',
      'color: orange; font-size: 14px; font-weight: bold;',
      '\nThe application is running in frontend-only mode.',
      '\nMost features will not work without a backend server.',
      '\n\nTo start the backend, run: npm run dev:server'
    );
  }
}

