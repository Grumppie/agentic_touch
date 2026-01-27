import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import z from "zod";


const suggestionSchema = z.object({
    suggestion: z.string().describe("Ai generated suggestion based on the current cursor context. empty string if no suggestion")
})
const SUGGESTION_PROMPT = `You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER and do NOT skip steps.

1. Examine next_lines.
   Return an empty string ONLY if next_lines clearly completes
   the SAME syntactic construct started at the cursor position.
   Examples of completion:
   - Closing braces or parentheses for the same block
   - Continuation of the same statement

   DO NOT treat next_lines as completion if it:
   - Starts a new declaration (interface, type, const, function, class, import)
   - Is unrelated top-level code
   - Only contains closing braces for a surrounding scope

   If the cursor line is incomplete, you MUST allow a suggestion.

2. Check before_cursor.
   If it ends with a complete statement such as:
   ";", "}", ")", "]"
   return an empty string.

3. If steps 1 and 2 do not apply, suggest what should be typed
   at the cursor position using context from full_code.

Rules:
- The suggestion is inserted immediately after the cursor.
- Do NOT repeat text already present in the file.
- Prefer minimal, syntactically valid completions.
- Return ONLY the suggested code, nothing else.
</instructions>`;


export async function POST(request: Request){
    try{

        const {userId} = await auth()

        if(!userId) return NextResponse.json({error: "Unauthorized access"},{status: 403})

        const{
            fileName,
            code,
            currentLine,
            previousLines,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            lineNumber
        } = await request.json()

        if(!code){
            return NextResponse.json({
                error: "Code is required"
            },
            {
                status: 400
            })
        }

        const prompt = SUGGESTION_PROMPT
            .replace("{fileName}",fileName)
            .replace("{code}",code)
            .replace("{currentLine}",currentLine)
            .replace("{previousLines}",previousLines || "")
            .replace("{textBeforeCursor}",textBeforeCursor)
            .replace("{textAfterCursor}",textAfterCursor)
            .replace("{nextLines}",nextLines || "")
            .replace("{lineNumber}",lineNumber.toString())

        console.log("prompt",prompt)

        const {output} = await generateText({
            model: openai("gpt-4.1-mini"),
            output: Output.object({schema: suggestionSchema}),
            prompt
        })

        console.log("ai output:", output)

        return NextResponse.json({
            suggestion: output.suggestion
        })

    }
    catch(error){
        console.error("suggestion error: ", error)
        return NextResponse.json(
            {
                error: "Failed to generate suggestion"
            },
            {
                status: 500
            }
        )
    }
}
