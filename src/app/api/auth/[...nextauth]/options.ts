import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { isContext } from "vm";

/**
 * NextAuth Options Configuration
 *
 * This configuration defines the authentication options for the NextAuth library.
 * It includes the providers, callbacks, and session settings.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  /**
   * Providers
   *
   * This section defines the authentication providers.
   * In this case, we're using the CredentialsProvider.
   */
  providers: [
    /**
     * CredentialsProvider
     *
     * This provider allows users to authenticate using their credentials (email and password).
     */
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        /**
         * Email
         *
         * The email field for the login form.
         */
        email: { label: "Email", type: "text" },
        /**
         * Password
         *
         * The password field for the login form.
         */
        password: { label: "Password", type: "password" }
      },
      /**
       * Authorize
       *
       * This function is called when the user submits the login form.
       * It checks the user's credentials and returns the user object if authenticated.
       *
       * @param credentials The user's credentials (email and password)
       * @returns The user object if authenticated, or an error message
       */
      async authorize(credentials: any): Promise<any> {
        await dbConnect()
        try {
          /**
           * Find the user by email or username
           */
          const user = await UserModel.findOne({
            $or: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ]
          })

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login")
          }

          /**
           * Compare the provided password with the stored password
           */
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

          if (isPasswordCorrect) {
            return user
          } else {
            throw new Error("Incorrect Password")
          }

        } catch (err: any) {
          throw new Error(`Authorization error : ${err.message}`);
        }
      }
    })
  ],
  /**
   * Callbacks
   *
   * This section defines the callback functions for the authentication flow.
   */
  callbacks: {
    /**
     * Session
     *
     * This function is called when the user's session is created or updated.
     * It adds the user's ID, isVerified, and isAcceptingMessages properties to the session.
     *
     * @param session The user's session object
     * @param token The user's token object
     * @returns The updated session object
     */
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session
    },
    /**
     * JWT
     *
     * This function is called when the user's token is created or updated.
     * It adds the user's ID, isVerified, and isAcceptingMessages properties to the token.
     *
     * @param token The user's token object
     * @param user The user object
     * @returns The updated token object
     */
    async jwt({ token, user }) {

      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token
    }
  },
  /**
   * Pages
   *
   * This section defines the custom pages for the authentication flow.
   */
  pages: {
    /**
     * Sign In Page
     *
     * The custom sign in page.
     */
    signIn: "/sign-in",
  },
  /**
   * Session
   *
   * This section defines the session settings.
   */
  session: {
    /**
     * Strategy
     *
     * The session strategy. In this case, we're using the JWT strategy.
     */
    strategy: "jwt"
  },
  /**
   * Secret
   *
   * The secret key for the NextAuth library.
   */
  secret: process.env.NEXTAUTH_SECRET,
}