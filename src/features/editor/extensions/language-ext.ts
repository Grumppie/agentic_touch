import {Extension} from "@codemirror/state"

import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import {python} from "@codemirror/lang-python"


export const getLanguageExtension = (filename: string):Extension=>{

    const ext = filename.split(".").pop()?.toLowerCase()

    switch(ext){
        case "js":
            return javascript()
        case "ts":
            return javascript({typescript: true})
        case "jsx":
            return javascript({jsx: true})
        case "tsx":
            return javascript({jsx: true, typescript: true})
        case "html":
            return html()
        case "css":
            return css()
        case "json":
            return json()
        case "md":
            return markdown()
        case "py":
            return python()
    }

    return javascript()

}