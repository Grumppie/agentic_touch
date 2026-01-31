import {EditorState, StateEffect, StateField} from "@codemirror/state"
import { fetcher } from "./fetcher"
import { EditorView, keymap, showTooltip, Tooltip } from "@codemirror/view"

// quickEditEffect: used to send messages which are used to update the editor state
// we are using one effect type for all our suggestions 
export const quickEditEffect = StateEffect.define<boolean>()

// StateField: holds our quick edit state in editor.
// create(): returns the initial value when the editor loads
// update(): called on every transction (keystroke, etc.) to potentially update the value
export const quickEditState = StateField.define<boolean>({
    create(){
        return false
    },
    update(value, transaction){
        // check each effect in this transaction 
        // return suggestion effect's value if included in current transaction
        for (const effect of transaction.effects){
            if(effect.is(quickEditEffect)){
                return effect.value
            }
        }

        if(transaction.selection){
            const selection = transaction.state.selection.main
            if(selection.empty){
                return false
            }
        }

        return value
    }
})

let editorView: EditorView | null = null;
let currentAbortController: AbortController | null = null

const createQuickEditToolTip = (state: EditorState): readonly Tooltip[] =>{
    const selection = state.selection.main

    if(!selection){
        return []
    }

    const isQuickEditActive = state.field(quickEditState)

    if(!isQuickEditActive){
        return []
    }

    return [
        {
            pos: selection.to,
            above: false,
            strictSide: false,
            create(){
                const dom = document.createElement("div")
                dom.className = "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";


                const form = document.createElement("form")
                form.className = "flex flex-col gap-2";

                const input = document.createElement("input")
                input.type = "text"
                input.placeholder = "Edit selected code..."
                input.className = "bg-transparent border-none outline-none px-2 py-1 font-sans w-100";
                input.autofocus = true

                const buttonContainer = document.createElement("div")
                buttonContainer.className = "flex items-center justify-between gap-2";

                const cancelButton = document.createElement("button")
                cancelButton.type = "button"
                cancelButton.textContent = "Cancel"
                cancelButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
                
                cancelButton.onclick = (e)=>{
                    e.preventDefault()

                    if(currentAbortController != null){
                        currentAbortController.abort(),
                        currentAbortController = null
                    }
                    if(editorView){
                        editorView.dispatch({
                            effects: quickEditEffect.of(false)
                        })
                    }
                }

                const submitButton = document.createElement("button")
                submitButton.type = "submit"
                submitButton.textContent = "Submit"
                submitButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

                form.onsubmit = async(e)=>{
                    e.preventDefault()

                    if(!editorView) return

                    const instruction = input.value.trim()
                    if(!instruction) return

                    const selection = editorView.state.selection.main
                    const selectedCode = editorView.state.doc.sliceString(
                        selection.from,
                        selection.to
                    )

                    const fullCode = editorView.state.doc.toString()

                    submitButton.disabled = true
                    submitButton.textContent = "Editing..."

                    currentAbortController = new AbortController()
                    const editedCode = await fetcher(
                        {
                            fullCode,
                            instruction,
                            selectedCode
                        },
                        currentAbortController.signal
                    )

                    if(editedCode){
                        editorView.dispatch({
                            changes:{
                                from: selection.from,
                                to: selection.to,
                                insert: editedCode
                            },
                            selection: {anchor: selection.from + editedCode.length},
                            effects: quickEditEffect.of(false)
                        })
                    }

                    submitButton.disabled = false
                    submitButton.textContent = "Submit"

                    currentAbortController = null

                }

                buttonContainer.appendChild(cancelButton)
                buttonContainer.appendChild(submitButton)

                form.appendChild(input)
                form.appendChild(buttonContainer)
                
                dom.appendChild(form)

                setTimeout(()=>input.focus(),0)


                return {dom}
            }
        }
    ]
}

const quickEditToolTipField = StateField.define<readonly Tooltip[]>({
    create(state){
        return createQuickEditToolTip(state)
    },
    update(tooltips,transaction){
        if(transaction.docChanged || transaction.selection){
            return createQuickEditToolTip(transaction.state)
        }

        for(const effect of transaction.effects){
            if(effect.is(quickEditEffect)){
                return createQuickEditToolTip(transaction.state)
            }
        }

        return tooltips
    },
    provide: (field) => showTooltip.computeN(
        [field],
        (state) => state.field(field)
    )
})

const quickEditKeyMap = keymap.of([
    {
        key: "Mod-k",
        run: (view)=>{
            const selection = view.state.selection.main
            if(selection.empty){
                return false
            }

            view.dispatch({
                effects: quickEditEffect.of(true)
            })
            return true
        }
    }
])

const captureViewExtention = EditorView.updateListener.of((update)=>{
    editorView = update.view
})

export const quickEdit = (fileName: string)=>[
    quickEditState, 
    quickEditToolTipField,
    quickEditKeyMap,
    captureViewExtention
]