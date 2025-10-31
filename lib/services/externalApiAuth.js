const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function verifyAndRefreshAuth() {
  console.log("Base URL: ", BASE_URL);
  try {
    if (!BASE_URL) {
      throw new Error('BASE_URL is not defined');
    }

    const response = await fetch(`${BASE_URL}/api/external-auth`);
    if (!response.ok) {
      throw new Error('Failed to verify authentication');
    }
    return response.json();
  } catch (error) {
    console.error('Auth verification failed:', error);
    throw error;
  }
}

export const externalApiAuth = {
  verifyAndRefreshAuth,
};