'use client'
import { useSession, signIn, signOut } from "next-auth/react"
import React from 'react'


export default function SignIn() {
    const { data: session } = useSession()
    console.log(session, 'session');

    if (session) {
        return (
            <>
                Signed in as {session.user.email} <br />
                <button>Sign out</button>
            </>
        )
    }
    return (
        <>
            Not signed in <br />
            <button>Sign in</button>
        </>
    )
}