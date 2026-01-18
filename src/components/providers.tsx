"use client"

import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react"
import { ClerkProvider, SignInButton, SignOutButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs"
import {ConvexProviderWithClerk} from "convex/react-clerk"
import React from "react"
import { ThemeProvider } from "./theme-provider"
import { UnAuthenticatedView } from "@/features/auth/components/unauthenticated-view"
import { AuthLoadingView } from "@/features/auth/components/authloading-view"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const Providers = ({children}:{children: React.ReactNode}) => {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <ThemeProvider
                    attribute={"class"}
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Authenticated>
                        <UserButton />
                        {children}
                    </Authenticated>

                    <Unauthenticated>
                        <UnAuthenticatedView />
                    </Unauthenticated>

                    <AuthLoading>
                        <AuthLoadingView />
                    </AuthLoading>
                </ThemeProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}