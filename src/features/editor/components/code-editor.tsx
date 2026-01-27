import { useEffect, useMemo, useRef } from 'react'
import {EditorView, keymap} from '@codemirror/view'
import {oneDark} from '@codemirror/theme-one-dark'
import { customTheme } from '../extensions/theme'
import { getLanguageExtension } from '../extensions/language-ext'
import {indentWithTab} from '@codemirror/commands'
import { MiniMap } from '../extensions/minimap'
import {indentationMarkers} from '@replit/codemirror-indentation-markers'
import { customSetup } from '../extensions/custom-setup'
import { suggestion } from '../extensions/suggestion'

interface props{
    fileName: string,
    initialValue?: string,
    onChange: (value: string)=>void
}

const CodeEditor = ({fileName, onChange, initialValue = ""}: props) => {

    const editorRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)

    const languageExtension = useMemo( ()=>getLanguageExtension(fileName),[fileName] )

    useEffect(()=>{
        if(!editorRef.current) return
        const view = new EditorView({
            doc: initialValue,
            parent: editorRef.current,
            extensions: [
                customSetup,
                languageExtension,
                suggestion(fileName),
                oneDark,
                customTheme,
                keymap.of([indentWithTab]),
                MiniMap(),
                indentationMarkers(),
                EditorView.updateListener.of((update)=>{
                    if(update.docChanged){
                        onChange(update.state.doc.toString())
                    }
                })
            ]
        })
        viewRef.current = view
        return ()=>{
            view.destroy()
        }
    },[languageExtension])

    return (
        <div ref={editorRef} className='size-fit pl-4 bg-background w-full min-w-150 h-[80vh]' />
    )
}

export default CodeEditor