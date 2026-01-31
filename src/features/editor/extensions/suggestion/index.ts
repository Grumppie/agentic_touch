import {StateEffect, StateField} from "@codemirror/state"
import { Decoration, DecorationSet, EditorView, keymap, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view"
import { fetcher } from "./fetcher"

// StateEffect: used to send messages which are used to update the editor state
// we are using one effect type for all our suggestions 
const setSuggestionEffect = StateEffect.define<string |null>()

// StateField: holds our suggestion state in editor.
// create(): returns the initial value when the editor loads
// update(): called on every transction (keystroke, etc.) to potentially update the value
const suggestionState = StateField.define<string |null>({
    create(){
        return null
    },
    update(value, transaction){
        // check each effect in this transaction 
        // return suggestion effect's value if included in current transaction
        for (const effect of transaction.effects){
            if(effect.is(setSuggestionEffect)){
                return effect.value
            }
        }

        return value
    }
})

class SuggestionWidget extends WidgetType{
    constructor(readonly text: string){
        super()
    }

    toDOM() {
        const span = document.createElement("span")
        span.textContent = this.text
        span.style.opacity = "0.4"
        span.style.pointerEvents = "none"
        return span
    }
}

let debounceTimer: number | null = null
let isWaitingSuggestion = false
const DEBOUNCE_DELAY = 300

export let currentAbortController: AbortController | null = null

const generatePayload = (view: EditorView, fileName: string)=>{

    // fileName,
    // code,
    // currentLine,
    // previousLines,
    // textBeforeCursor,
    // textAfterCursor,
    // nextLines,
    // lineNumber

    const code = view.state.doc.toString() || " "

    const cursorAt = view.state.selection.main.head
    const currentLine = view.state.doc.lineAt(cursorAt)

    const textBeforeCursor = currentLine.text.slice(0, cursorAt - currentLine.from)
    const textAfterCursor = currentLine.text.slice(cursorAt - currentLine.from)

    const previousLines: string[] = []
    const fetchPreviousLines: number = Math.min(5,currentLine.number - 1)
    for(let i = fetchPreviousLines; i>=1; i--){
        previousLines.push(view.state.doc.line(currentLine.number - i).text)
    }

    const nextLines: string[] = []
    const totalLines = view.state.doc.lines
    const fetchNextLines: number = Math.min(5,totalLines - currentLine.number)
    for(let i = 1; i<= fetchNextLines; i++){
        nextLines.push(view.state.doc.line(currentLine.number + i).text)
    }

    return{
        fileName,
        code,
        currentLine: currentLine.text,
        previousLines: previousLines.join("\n"),
        textBeforeCursor,
        textAfterCursor,
        nextLines: nextLines.join("\n"),
        lineNumber: currentLine.number.toString()
    }

}

const DeboucePlugin = (fileName: string)=>{
    return ViewPlugin.fromClass(
    class{
        
        constructor(view:EditorView){
            this.triggerSuggesion(view)
        }
        
        update(update: ViewUpdate){
            if(update.docChanged || update.selectionSet){
                this.triggerSuggesion(update.view)
            }
        }

        triggerSuggesion(view:EditorView){



            if(debounceTimer != null){
                clearTimeout(debounceTimer)
            }

            if(currentAbortController !=null){
                currentAbortController.abort()
            }

            isWaitingSuggestion = true

            debounceTimer = window.setTimeout(async()=>{

                const payload = generatePayload(view,fileName)

                if(!payload){ 
                    isWaitingSuggestion = false
                    view.dispatch({
                        effects: setSuggestionEffect.of(null)
                    })
                    return
                }

                currentAbortController = new AbortController()

                const suggestion = await fetcher(
                    payload,
                    currentAbortController.signal
                )

                isWaitingSuggestion = false

                view.dispatch({
                    effects: setSuggestionEffect.of(suggestion)
                })
            }, DEBOUNCE_DELAY)

        }
        destroy(){
            if(debounceTimer != null) clearTimeout(debounceTimer)
            if(currentAbortController != null) currentAbortController.abort()
        }
    }
)
}

const renderPlugin = ViewPlugin.fromClass(
    class{
        decorations: DecorationSet

        constructor(view: EditorView){
            this.decorations = this.build(view)
        }

        update(update: ViewUpdate){

            const suggestionChanged = update.transactions.some((transaction)=>(
                transaction.effects.some((effect)=>(
                    effect.is(setSuggestionEffect)
                ))
            ))

            // rebuild decorations if doc changed or cursor moved or suggestion changed
            const shouldRebuild = update.docChanged || update.selectionSet || suggestionChanged

            if(shouldRebuild){
                this.decorations = this.build(update.view)
            }

        }

        build(view: EditorView){

            if(isWaitingSuggestion){
                return Decoration.none
            }

            const suggestion = view.state.field(suggestionState)
            if(!suggestion){
                Decoration.none
            }

            const cursor = view.state.selection.main.head
            return Decoration.set([
                Decoration.widget({
                    widget: new SuggestionWidget(suggestion!),
                    side: 1
                }).range(cursor)
            ])
        }

    },
    {
        decorations: (plugin)=> plugin.decorations
    }
)

const acceptSuggestionKeymap = keymap.of([
    {
        key: "Tab",
        run: (view)=>{
            const suggestion = view.state.field(suggestionState)
            if(!suggestion){
                return false // let tab do it's normal ting
            }

            const curosr = view.state.selection.main.head
            view.dispatch({
                changes: {from: curosr, insert: suggestion}, // insert the suggestion text
                selection: { anchor: curosr + suggestion.length}, // move the cursor
                effects: setSuggestionEffect.of(null) // clear suggestion
            })
            return true // we handled the tab, don't tab
        }
    }
])

export const suggestion = (fileName: string)=>[
    suggestionState, // editor state storeage
    DeboucePlugin(fileName),
    renderPlugin, // renders the ghost text
    acceptSuggestionKeymap, // tab to accept
]