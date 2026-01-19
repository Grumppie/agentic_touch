"use client"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import * as Sentry from "@sentry/nextjs"
import { useAuth } from "@clerk/nextjs";

export default function Demo(){

    const {userId} = useAuth()

    const [loading,setLoading] = useState(false);
    const [loadingBg,setLoadingBg] = useState(false);


    const handleBlocking = async()=>{
        setLoading(true)
        await fetch("/api/demo/blocking",{method:"POST"})
        setLoading(false)
    }

    const handleBackground = async()=>{
        setLoadingBg(true)
        await fetch("/api/demo/unblocking",{method:"POST"})
        setLoadingBg(false)
    }

    
    const handleClientError = ()=>{
        Sentry.logger.info("User attempting to click on client Function",{userId})
        throw new Error("Client Error: Something went wrong")
    }

    const handleAPIError = async()=>{
        await fetch('/api/demo/error',{method:"POST"})
    }

    const handleInggestError = async()=>{
        await fetch('/api/demo/inngest-error',{method: "POST"})
    }

    return(
        <div className="p-2 bg-card-foreground rounded flex gap-2 flex-col max-w-fit">
            <Button variant={"secondary"} onClick={handleBlocking} disabled={loading}>
                {loading? "loading...":"Blocking"}
            </Button>
            <Button variant={"secondary"} onClick={handleBackground} disabled={loadingBg}>
                {loadingBg? "loading...":"Background"}
            </Button>
            <Button variant={"destructive"} onClick={handleClientError} disabled={loadingBg}>
                Client Error
            </Button>
            <Button variant={"destructive"} onClick={handleAPIError} disabled={loadingBg}>
                API Error
            </Button>
            <Button variant={"destructive"} onClick={handleInggestError} disabled={loadingBg}>
                Inggest Error
            </Button>
        </div>
    )
}