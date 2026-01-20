import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from "lucide-react"
import { useState } from "react"
import { Id } from "../../../../../convex/_generated/dataModel"
import { useProject } from "../../hooks/use-projects"
import { Button } from "@/components/ui/button"
import { useCreateFile, useCreateFolder, useFolderContents } from "../../hooks/use-files"
import { CreateInput } from "./create-input"
import LoadingRow from "./loading-row"
import Tree from "./tree"

const FileExplorer = ({
    projectId
}:{
    projectId: Id<"projects">
}) => {

    const [isOpen, setIsOpen] = useState(false)
    const [collapseKey, setCollapseKey] = useState(0)
    const [creating, setCreating] = useState<"file"|"folder"|null>( null )

    const createFile = useCreateFile()
    const createFolder = useCreateFolder()
    const project = useProject(projectId)

    const rootFiles = useFolderContents({
        projectId,
        enabled:isOpen
    })

    const handleCreate = (name: string) => {
        setCreating(null)

        if(creating === "file"){
            createFile({
                projectId: projectId,
                parentId: undefined,
                content: "",
                name,
            })
        }
        else{
            createFolder({
                projectId: projectId,
                parentId: undefined,
                name,
            })
        }

    }


    return (
        <div className="h-full bg-sidebar">
            <ScrollArea>
                <div 
                    role="button" 
                    onClick={()=> setIsOpen((value)=>!value)}
                    className="group/project cursor-pointer w-full flex items-center text-left gap-0.5 h-5.5 bg-accent font-bold"
                >
                    <ChevronRightIcon
                        className={cn(
                            "size-4 shrink-0 text-muted-foreground mx-1",
                            isOpen && "rotate-90"
                        )}
                    />
                    <p className="text-xs uppercase line-clamp-1">{project?.name ?? "Loading..."}</p>

                    <div className="opacity-0 group-hover/project:opacity-100 transition-non duration-0 flex items-center gap-0.5 ml-auto">
                        <Button
                            onClick={(e)=>{
                                e.stopPropagation()
                                e.preventDefault()
                                setIsOpen(true)
                                setCreating("file")
                            }}
                            variant="highlight"
                            size="icon-xs"
                        >
                            <FilePlusCornerIcon className="size-3.5" />
                        </Button>
                        <Button
                            onClick={(e)=>{
                                e.stopPropagation()
                                e.preventDefault()
                                setIsOpen(true)
                                setCreating("folder")
                            }}
                            variant="highlight"
                            size="icon-xs"
                        >
                            <FolderPlusIcon className="size-3.5" />
                        </Button>
                        <Button
                            onClick={(e)=>{
                                e.stopPropagation()
                                e.preventDefault()
                                setIsOpen(true)
                                setCollapseKey((prev)=>prev+1)
                            }}
                            variant="highlight"
                            size="icon-xs"
                        >
                            <CopyMinusIcon className="size-3.5" />
                        </Button>
                    </div>
                </div>
                {isOpen && 
                    <>
                        {rootFiles === undefined &&(
                            <LoadingRow level={0} />
                        )}
                        {creating && (
                            <CreateInput 
                                type={creating}
                                level={0}
                                onSubmit={handleCreate}
                                onCancel={()=>setCreating(null)}
                            />
                        )}

                        {rootFiles?.map(
                            (item)=>(
                                <Tree
                                    key={`${item._id}-${collapseKey}`}
                                    item={item}
                                    level={0}
                                    projectId={projectId}
                                />

                            )
                        )}
                    </>
                }
            </ScrollArea>
        </div>
    )
}

export default FileExplorer