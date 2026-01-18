"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"

export default function test(){

  const projects = useQuery(api.projects.get)

  const createProject = useMutation(api.projects.create)

  return(
    <div className="mx-auto flex flex-col gap-2 p-4">

      <Button onClick={()=>createProject({
        name: "New Project"
      })}>
        Add new
      </Button>

      {projects?.map((project)=>{
        return(
          <div className="flex flex-col border rounded p-2" key={project._id}>
            <p>{project.name}</p>
            <p>OwnerId: {project.ownerId}</p>
          </div>
        )
      })}
    </div>
  )
}