import { inngest } from '@/inngest/client'


export async function POST(){
    await inngest.send({
        name: "demo/generate",
        data: {
            prompt: "whats the difference between blocking and non-blocking request when mordern ui doesn't event stick"
        }
    })

    return Response.json({status: "started"})
}