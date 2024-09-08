"use client";
import React, { use } from 'react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const page = () => {
  const tasks = useQuery(api.tasks.getTasks);
  const deleteTask = useMutation(api.tasks.deleteTask);
  return (
    <div className='p-10 flex flex-col gap-4'>
      <h1 className='text-5xl'> All tasks are here in real-time</h1>
      {
        tasks?.map(( task, key) => {
          return (
            <div className="flex gap-4">
              <span>{task.text}</span>
              <button onClick={()=>{deleteTask({id: task._id})}}>Delete</button>
            </div>
          )
        })
      }

    </div>
  )
}

export default page;
