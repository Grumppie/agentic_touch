import { firecrawl } from "@/lib/firecrawl";
import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
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

        const urls: string[] = instruction.match(URL_REGEX) || []
        let context = ""
        if(urls.length > 0){

            const scrapedDocs = await Promise.all(
                urls.map(async(url)=>{
                    try{
                        const scrapedDoc = await firecrawl.scrape(url,{
                            formats: ["markdown"]
                        })
                        if(scrapedDoc.markdown){
                            return `<doc url=${url}> ${scrapedDoc.markdown} </doc>`
                        }
                        return null
                    }
                    catch{
                        return null
                    }
                })
            )

            const validResult = scrapedDocs.filter(Boolean)

            if(validResult.length>0){
                context = `<documentation>\n${scrapedDocs.join("\n\n")}\n</documentation>`
            }
        }
        
        
        const prompt = QUICK_EDIT_PROMPT
            .replace("{selectedCode}", selectedCode)
            .replace("{fullCode}", fullCode || "")
            .replace("{instruction}", instruction)
            .replace("{documentation}", context)

        const {output} = await generateText({
            model: openai("gpt-4.1-mini"),
            output: Output.object({schema: quickEditSchema}),
            prompt
        })

        return NextResponse.json({editedCode: output.editedCode},{status: 200})
    }
    catch(e){
        console.error(`Error while editing code: ${e}`)
        return NextResponse.json(
            {
                error: `Error while generating edited code: ${e}`,
            },
            {
                status: 500
            }
        )
    }
}