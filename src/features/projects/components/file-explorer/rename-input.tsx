import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { useState } from "react";
import { getItemPadding } from "./constants";
import { cn } from "@/lib/utils";

export const RenameInput = ({
    type,
    level,
    onCancel,
    onSubmit,
    initialValue,
    isOpen,
}:{
    type:"file" | "folder"
    level:number
    initialValue: string
    onSubmit: (name: string)=>void
    onCancel: ()=>void
    isOpen?: boolean
})=>{
    const [value,setValue] = useState(initialValue)

    const handleSubmit = ()=>{
        const trimmedValue = value.trim() 
        if(trimmedValue){
            onSubmit(trimmedValue)
        }
        else{
            onCancel()
        }
    }

    return(
        <div
            className="w-full flex items-center h-5.5 bg-accent/30 gap-1"
            style={{paddingLeft: getItemPadding(level, type === "file")}}
        >
            <div className="flex items-center">

                {
                    type==="folder"&&(
                        <ChevronRightIcon className={cn(
                            "size-4 shrink-0 text-muted-foreground",
                            isOpen && "rotate-90"
                        )} />
                    )
                }

                {
                    type==="file"&&(
                        <FileIcon fileName={value} autoAssign className="size-4" />
                    )
                }

                {
                    type==="folder"&&(
                        <FolderIcon folderName={value} className="size-4" />
                    )
                }
            </div>
            <input
                autoFocus
                type="text"
                onFocus={(e)=>{
                    if(type === "folder"){
                        e.currentTarget.select()
                    }
                    else{
                        const value = e.currentTarget.value
                        const lastDotIndex = value.lastIndexOf('.')
                        if(lastDotIndex > 0){
                            e.currentTarget.setSelectionRange(0,lastDotIndex)
                        }else{
                            e.currentTarget.select()
                        }
                    }
                }}
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
                onBlur={handleSubmit}
                onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                        handleSubmit()
                    }
                    if(e.key === "Escape"){
                        onCancel()
                    }
                }}
            >
            </input>
        </div>
    )

}