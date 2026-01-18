import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { demoGenerate } from "@/inngest/function";

export const runtime = "nodejs";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    demoGenerate, // <-- This is where you'll always add all your functions
  ],
});
