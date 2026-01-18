"use client"
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Demo(){

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

    return(
        <div className="bg-amber-200">
            <Button variant={"destructive"} onClick={handleBlocking} disabled={loading}>
                {loading? "loading...":"Blocking"}
            </Button>
            <Button variant={"destructive"} onClick={handleBackground} disabled={loadingBg}>
                {loading? "loading...":"Background"}
            </Button>
        </div>
    )
}