import { useState } from "react"
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { useCreateFile, useCreateFolder, useDeleteFile, useFolderContents, useRenameFile } from "../../hooks/use-files"
import TreeItemWrapper from "./tree-item-wrapper"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import LoadingRow from "./loading-row"
import { getItemPadding } from "./constants"
import { CreateInput } from "./create-input"
import { RenameInput } from "./rename-input"

const Tree = ({
    item,
    level = 0,
    projectId
}:{
    item: Doc<"files">
    level?: number
    projectId: Id<"projects">
}) => {

    const [isOpen,setIsOpen] = useState(false)
    const [isRenaming,setIsRenaming] = useState(false)
    const [creating,setIsCreating] = useState<"file" | "folder" | null>(null)

    const renameFile = useRenameFile()
    const deleteFile = useDeleteFile()
    const createFile = useCreateFile()
    const createFolder = useCreateFolder()

    const folderContents = useFolderContents({
        projectId,
        parentId: item._id,
        enabled: item.type==="folder" && isOpen
    })

    const startCreating = (type: "file" | "folder") =>{
        setIsOpen(true)
        setIsCreating(type)
    }

    const handleCreate = (name: string)=>{
        setIsCreating(null)
        if(creating === "file"){
            createFile({
                parentId: item._id,
                name,
                projectId,
                content: ""
            })
        }
        else{
            createFolder({
                parentId: item._id,
                name,
                projectId,
            })
        }
    }

    const handlRename = (name: string)=>{
        setIsRenaming(false)
        if(item.name == name){
            return
        }
        renameFile({
            id: item._id,
            newName: name
        })
    }



    if(item.type === "file"){
        const fileName = item.name


        if(isRenaming){
            return(
                <>
                    <div
                        className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
                    >
                        <RenameInput 
                            type={"file"}
                            initialValue={fileName}
                            level={level}
                            onSubmit={handlRename}
                            onCancel={()=>setIsRenaming(false)}
                        />
                    </div>
                </>
            )
        }

        return (
            <TreeItemWrapper
                item={item}
                level={level}
                onClick={()=>{}}
                onDoubleClick={()=>{}}
                onCreateFile={()=>{}}
                onCreateFolder={()=>{}}
                onDelete={async()=>{
                    // close tab
                    await deleteFile({id: item._id})
                }}
                onRename={()=>setIsRenaming(true)}
                isActive={false}
            >
                <FileIcon fileName={fileName} autoAssign className="size-4" />
                <span className="truncate text-sm">{fileName}</span>
            </TreeItemWrapper>
        )
    }

    const folderName = item.name

    const folderContent = (
        <>
            <div className="flex items-center gap-0.5">
                <ChevronRightIcon 
                    className={cn(
                        "size-4 shrink-0 text-muted-foreground",
                        isOpen && "rotate-90"
                    )}
                />
                <FolderIcon folderName={folderName} className="size-4" />
            </div>
        
            <span className="truncate text-sm">{folderName}</span>
        </>
    )

    if(creating){
        return(
            <>
                <button
                    onClick={()=>setIsOpen((value)=>!value)}
                    className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
                    style={{paddingLeft: getItemPadding(level, false)}}
                >
                    {folderContent}
                </button>
                {isOpen && (
                    <>
                        {folderContents === undefined && <LoadingRow level={level + 1} />}
                        <CreateInput 
                            type={creating}
                            level={level+1}
                            onSubmit={handleCreate}
                            onCancel={()=>setIsCreating(null)}
                        />

                        {folderContents?.map((subItem)=>(
                            <Tree
                                key={subItem._id}
                                item={subItem}
                                level={level+1}
                                projectId={projectId}
                            />
                        ))}
                    </>
                )}
            </>
        )
    }

    if(isRenaming){
        return(
            <>
                <RenameInput 
                    type={"folder"}
                    level={level}
                    initialValue={item.name}
                    onSubmit={handlRename}
                    onCancel={()=>setIsCreating(null)}
                    isOpen={isOpen}
                />
                {folderContents?.map((subItem)=>(
                    <Tree
                        key={subItem._id}
                        item={subItem}
                        level={level+1}
                        projectId={projectId}
                    />
                ))}
            </>
        )
    }

  return (
    <>
        <TreeItemWrapper
            item={item}
            level={level}
            onClick={()=>setIsOpen((value)=>!value)}
            onDoubleClick={()=>{}}
            onCreateFile={()=> startCreating("file")}
            onCreateFolder={()=> startCreating("folder")}
            onDelete={async()=>{
                // close tab
                await deleteFile({id: item._id})
            }}
            onRename={()=>setIsRenaming(true)}
            isActive={false}
        >
            {folderContent}
        </TreeItemWrapper>
        {
            isOpen &&(
                <>
                    {
                        folderContents === undefined 

                            ? <LoadingRow level={level + 1}/>
                            : folderContents?.map((subItem)=>(
                                    <Tree
                                        key={subItem._id}
                                        item={subItem}
                                        level={level+1}
                                        projectId={projectId}
                                    />
                                ))
                    }
                </>
            )
        }
    </>
  )
}

export default Tree