import React from "react";
import ToggleTheme from "./ToggleTheme";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Logo from "../assets/Logo.png";
import { Link, useParams } from "react-router-dom";

const Topbar = () => {
  const { id } = useParams();
  const basePath = `/${id}/dashboard`;

  return (
    <div className="w-full h-16 flex justify-between items-center border-b bg-background px-6 py-4 shadow-sm">
      
      {/* Logo */}
      <div className="w-20 h-auto flex items-center">
        <img src={Logo} alt="Company Logo" className="w-full" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="Home">
        <TabsList>
          <TabsTrigger value="Home"><Link to={basePath}>Home</Link></TabsTrigger>
          <TabsTrigger value="Resume"><Link to={`${basePath}/resume`}>Resume</Link></TabsTrigger>
          <TabsTrigger value="Cover Letter"><Link to={`${basePath}/cover-letter`}>Cover Letter</Link></TabsTrigger>
          <TabsTrigger value="Resources"><Link to={`${basePath}/resources`}>Resources</Link></TabsTrigger>
          <TabsTrigger value="Interview Prep"><Link to={`${basePath}/interview`}>Interview Prep</Link></TabsTrigger>
          <TabsTrigger value="Extension"><Link to={`${basePath}/extension`}>Extension</Link></TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Right Side: Theme Toggle & Avatar */}
      <div className="flex items-center gap-6">
        <ToggleTheme />
        <Link to={`${basePath}/profile`}>
          <Avatar className="cursor-pointer rounded-full" aria-label="User Profile">
            <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
      </div>

    </div>
  );
};

export default Topbar;
