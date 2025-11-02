import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.EXTERNAL_API_BASE_URL;

function isTokenValid(token) {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

async function loginToExternalApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jwt/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: process.env.EXTERNAL_API_EMAIL,
                password: process.env.EXTERNAL_API_PASSWORD
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`External API login failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function refreshExternalToken(refreshToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jwt/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Refresh error:', error);
        throw error;
    }
}

export async function GET() {
    try {
        if (!API_BASE_URL || !process.env.EXTERNAL_API_EMAIL || !process.env.EXTERNAL_API_PASSWORD) {
            throw new Error('Missing required environment variables');
        }

        const cookieStore = cookies();
        const jwt = cookieStore.get('api_jwt');
        const refreshToken = cookieStore.get('api_refresh_token');

        // If no tokens exist at all, perform login
        if (!jwt?.value && !refreshToken?.value) {
            const loginResponse = await loginToExternalApi();

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24
            };

            cookies().set('api_jwt', loginResponse.access_token, cookieOptions);
            cookies().set('api_refresh_token', loginResponse.refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30
            });

            return Response.json({
                success: true,
                message: 'Login successful',
                debug: { action: 'initial_login' }
            });
        }

        // If we have a JWT, check if it's still valid
        if (jwt?.value && isTokenValid(jwt.value)) {
            return Response.json({
                success: true,
                message: 'Token is valid',
                debug: { action: 'token_still_valid' }
            });
        }

        // If JWT is invalid/expired but we have refresh token, try to refresh
        if (refreshToken?.value) {
            try {
                const { access_token, refresh_token } = await refreshExternalToken(refreshToken.value);

                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24
                };

                cookies().set('api_jwt', access_token, cookieOptions);
                cookies().set('api_refresh_token', refresh_token, {
                    ...cookieOptions,
                    maxAge: 60 * 60 * 24 * 30
                });

                return Response.json({
                    success: true,
                    message: 'Token refreshed successfully',
                    debug: { action: 'token_refreshed' }
                });
            } catch (refreshError) {
                console.error('Refresh failed, performing new login');
            }
        }

        // If we reach here, we need to perform a new login
        const loginResponse = await loginToExternalApi();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24
        };

        cookies().set('api_jwt', loginResponse.access_token, cookieOptions);
        cookies().set('api_refresh_token', loginResponse.refresh_token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 30
        });

        return Response.json({
            success: true,
            message: 'New login successful',
            debug: { action: 'fallback_login' }
        });

    } catch (error) {
        console.error('Route handler error:', error);
        return Response.json({
            success: false,
            message: error.message,
            debug: { error: error.message }
        }, {
            status: 500
        });
    }
}