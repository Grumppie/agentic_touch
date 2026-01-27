import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";

const URL_REGEX = /https?:\/\/[^\s]+/g

const quickEditSchema = z.object({
    editedCode: z.string().describe("Ai edited code based on the instruction.")
})


const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

export async function POST(request: Request){
    try{
        const {userId} = await auth()
        const {selectedCode, fullCode, instruction} = await request.json()

        if(!userId){
            return NextResponse.json(
                {
                    error: "unAuthorized"
                },
                {
                    status: 403
                }
            )
        }

        if(!selectedCode){
            return NextResponse.json(
                {
                    error: "selectedCode is required"
                },
                {
                    status: 400
                }
            )
        }

        if(!fullCode){
            return NextResponse.json(
                {
                    error: "fullCode is required"
                },
                {
                    status: 400
                }
            )
        }

        if(!instruction){
            return NextResponse.json(
                {
                    error: "instruction is required"
                },
                {
                    status: 400
                }
            )
        }

        
        

    }
    catch(e){
        
    }
}