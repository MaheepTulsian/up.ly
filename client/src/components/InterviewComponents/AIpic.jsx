import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
const AIpic = () => {
  return (
    <div>
        <Avatar className="cursor-pointer rounded-full" aria-label="User Profile">
            <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    </div>
  )
}

export default AIpic
