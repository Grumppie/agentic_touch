import ky from "ky"
import { toast } from "sonner"
import z from "zod"

const quickEditRequestSchema = z.object({
    selectedCode: z.string(),
    fullCode: z.string(),
    instruction: z.string()
})

const quickEditResponseSchema = z.object({
    editedCode: z.string(),
})

type QuickEditRequest = z.infer<typeof quickEditRequestSchema>
type QuickEditResponse = z.infer<typeof quickEditResponseSchema>

export const fetcher = async(
    payload: QuickEditRequest,
    signal: AbortSignal
) =>{
    
    try{
        const validatedPayload = quickEditRequestSchema.parse(payload)


        const response = await ky
            .post("/api/quick-edit",{
                json: validatedPayload,
                signal,
                timeout: 30_000,
                retry: 0
            })
            .json<QuickEditResponse>()

        const validatedResponse = quickEditResponseSchema.parse(response)

        return validatedResponse.editedCode
    }
    catch (error){
        if(error instanceof Error && error.name === "AbortError"){
            return null
        }
        console.error("Error while generating edited code",error)
        toast.error("Error while generating edited code")
        return null
    }

}