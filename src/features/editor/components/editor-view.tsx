import { useFile, useUpdateFile } from "@/features/projects/hooks/use-files"
import { Id } from "../../../../convex/_generated/dataModel"
import { useEditor } from "../hooks/use-editor"
import { FileBreadcrumbs } from "./file-breadcrums"
import TopNavigation from "./top-navigation"
import Image from "next/image"
import CodeEditor from "./code-editor"
import { useRef } from "react"

const DebounceMs = 1500


const EditorView = ({projectId}:{projectId:Id<"projects">}) => {

    const {activeTabId} = useEditor(projectId)

    const activeFile = useFile(activeTabId)

    const updateFile = useUpdateFile()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const isActiveBinary = activeFile && activeFile.storageId
    const isActiveFileText = activeFile && !activeFile.storageId

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center">
                <TopNavigation projectId={projectId} />
            </div>
            {activeTabId && <FileBreadcrumbs projectId={projectId}/>}
            <div className="flex-1 min-h-0 bg-background">
                {!activeFile  && (
                    <div className="size-full flex items-center justify-center">
                        <Image 
                            src={'/logo-alt.svg'}
                            alt="AgenticTouch"
                            width={80}
                            height={80}
                            className="opacity-25"
                        />
                    </div>
                )}
                {isActiveFileText && (
                    <CodeEditor
                        key = {activeTabId} 
                        initialValue={activeFile.content} 
                        fileName={activeFile.name} 
                        onChange={(content: string)=>{
                            if(timeoutRef.current){
                                clearTimeout(timeoutRef.current)
                            }

                            timeoutRef.current = setTimeout(()=>{
                                updateFile({id:activeFile._id,content})
                            }, DebounceMs)
                        }} 
                        />
                )}
                {isActiveBinary && <p>
                    {/* implement binary view */}
                    </p>}
            </div>
        </div>
    )
}

export default EditorView