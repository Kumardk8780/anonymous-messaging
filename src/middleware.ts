import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware function to handle authentication and redirects.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse | undefined>} A promise resolving to the next response or undefined.
 */


export async function middleware(request: NextRequest) {
    try {
        console.log("request: ", request)
        const token = await getToken({ req: request });
        console.log("token: ", token)
        const url = request.nextUrl;
        console.log("url", url)

        //* Hanlde the root path without redirectin unless necessary
        // if (url.pathname === '/') {

        //     //* Check if the urser needs to be authenitacted or perform other checks specific to '/'
        //     return NextResponse.next();
        // }

        //* Redirect authenticated user from sign-in , verify , and sign-up pages to dashboard
        if (token && (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/verify') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/')
        )) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (!token && url.pathname.startsWith('/dashborad')) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }

        return NextResponse.next();

        //* Fallback to return a 404 response for unmatched paths
        // return NextResponse.next({
        //     status: 404,
        //     headers: {
        //         'content-type': 'text/html',
        //     },
        //     statusText: "Not Found"
        // });

    } catch (error) {
        console.error("Error in middleware: ", error);
        return NextResponse.next({
            status: 500,
            headers: {
                'content-type': 'text/plain',
            },
            statusText: "Internal Server Error"
        })
    }
}

/**
 * Configuration for the middleware.
 */
export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/dashboard/:path*',
        '/verify',
        '/sign-up',
    ],
};