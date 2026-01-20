import {useMutation, useQuery} from 'convex/react'
import {api} from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useAuth } from '@clerk/nextjs'

export const useProjects=()=>{
    return useQuery(api.projects.get)
}

export const useProjectsPartial=(limit:number)=>{
    return useQuery(api.projects.getPartial, {
        limit
    })
}

export const useCreateProjects=()=>{
    return useMutation(api.projects.create).withOptimisticUpdate(
        (localstore, args)=>{
            const existingProjects = localstore.getQuery(api.projects.get)
            if(existingProjects != null){
                const now = Date.now()
                const newProject = {
                    _id: crypto.randomUUID() as Id<"projects">,
                    _creationTime: now,
                    name: args.name,
                    ownerId: "anonymous",
                    updatedAt: now
                }
                localstore.setQuery(api.projects.get,{},[
                    newProject,
                    ...existingProjects
                ])
            }
        }
    )
}

export const useProject=(projectId: Id<"projects">)=>{
    return useQuery(api.projects.getById, {id: projectId})
}


export const useRenameProject=(projectId: Id<"projects">)=>{
    return useMutation(api.projects.rename).withOptimisticUpdate(
        (localstore, args)=>{
            const existingProject = localstore.getQuery(
                api.projects.getById,
                {
                    id: projectId
                }
            )
            if(existingProject != null ){
                localstore.setQuery(
                    api.projects.getById,
                    {id:projectId},
                    {
                        ...existingProject,
                        name: args.newName,
                        updatedAt: Date.now()
                    }
                )
            }

            const existingProjects = localstore.getQuery(api.projects.get)
            if(existingProjects != null){
                localstore.setQuery(
                    api.projects.get,
                    {},
                    existingProjects.map((project)=>{
                        return project._id === args.id?{
                            ...project,
                            name: args.newName,
                            updatedAt: Date.now()
                        }: project
                    }))
            }
        }
    )
}
