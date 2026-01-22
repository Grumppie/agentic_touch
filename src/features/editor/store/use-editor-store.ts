import { Id } from "../../../../convex/_generated/dataModel";
import {create} from "zustand"

interface TabState{
    openTabs: Id<"files">[]
    activeTabId: Id<"files"> | null
    previewTabId: Id<"files"> | null
}

const defaultTabState: TabState ={
    openTabs: [],
    activeTabId: null,
    previewTabId: null
}

interface EditorStore{
    tabs: Map<Id<"projects">,TabState>

    getTabState: (projectId: Id<"projects">) => TabState

    openFile: (
        projectId: Id<"projects">,
        fileId: Id<"files">,
        options: {pinned: boolean}
    ) => void

    closeTab:(
        projectId: Id<"projects">,
        fileId: Id<"files">
    ) => void

    closeAllTabs:(
        projectId: Id<"projects">
    ) => void

    setActiveTab:(
        projectId: Id<"projects">,
        fileId: Id<"files">
    ) => void
}

// other way of writing this and understand this TL;DR

// create<EditorStore>()((set, get) => {}) is currying
// First call → binds the type
// Second call → provides the implementation
// Required for middleware + good TypeScript inference
// This is the correct, idiomatic Zustand pattern

const createEditorStore = create<EditorStore>() // // configure the store types

export const useEditorStore = createEditorStore ((set,get)=>({ 
     // now configure the store logic
    tabs: new Map(),

    getTabState: (projectId)=>{
        return get().tabs.get(projectId) ?? defaultTabState
    },

    openFile: (projectId, fileId, {pinned})=>{
        const tabs = new Map(get().tabs)
        const state = tabs.get(projectId) ?? defaultTabState
        const {openTabs, previewTabId} = state
        const isOpen = openTabs.includes(fileId)

        // case 1: Opening as preview: replace existing preview or add new

        if(!isOpen && !pinned){
            const newTabs = previewTabId
                ? openTabs.map((tab)=> tab === previewTabId ? fileId : tab)
                : [...openTabs, fileId]
            
            tabs.set(projectId,{
                openTabs: newTabs,
                activeTabId: fileId,
                previewTabId: fileId
            })

            set({tabs})
            return
        }

        // case 2: Opening as pinned: add new tab
        if(!isOpen && pinned){
            const newTabs = [...openTabs, fileId]

            tabs.set(projectId,{
                ...state,
                openTabs: newTabs,
                activeTabId: fileId,
            })

            set({tabs})
            return
        }

        // case 3: File already Open: just activate and pin if double-clicked
        const shouldPin = pinned && previewTabId == fileId
        tabs.set(projectId,{
            ...state,
            activeTabId: fileId,
            previewTabId: shouldPin ? null : previewTabId
        })
        set({tabs})

    },

    closeTab: (projectId, fileId) =>{
        const tabs = new Map(get().tabs)
        const state = tabs.get(projectId) ?? defaultTabState
        const {openTabs, activeTabId, previewTabId} = state
        const tabIndex = openTabs.indexOf(fileId)

        if(tabIndex == -1){
            return
        }

        const newTabs = openTabs.filter((tab)=>tab !== fileId)

        let newActiveTab = activeTabId

        if(activeTabId === fileId){
            if(newTabs.length === 0){
                newActiveTab = null
            }
            else if (tabIndex >= newTabs.length){
                newActiveTab = newTabs?.at(-1) ?? null
            }
            else{
                newActiveTab = newTabs[tabIndex]
            }
        }

        tabs.set(projectId,{
            activeTabId: newActiveTab,
            previewTabId: previewTabId === fileId ? null : previewTabId,
            openTabs: newTabs
        })

        set({tabs})
    },

    closeAllTabs: (projectId)=>{
        const tabs = new Map(get().tabs)
        tabs.set(projectId,defaultTabState)
        set({tabs})
    },

    setActiveTab: (projectId, fileId)=>{
        const tabs = new Map(get().tabs)
        const state = tabs.get(projectId) ?? defaultTabState
        tabs.set(projectId,{
            ...state,
            activeTabId: fileId
        })
        set({tabs})
    }

}))

