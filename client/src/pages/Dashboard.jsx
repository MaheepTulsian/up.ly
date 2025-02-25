import React from "react";
import useAuthStore from "../store/AuthStore.js";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar"
import { Separator } from "../components/ui/separator";
import ToggleTheme from "../components/ToggleTheme";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";

function Dashboard() {
  const { user, logout } = useAuthStore();

  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
  }

  // const handleLogout = async (e) => {
  //   e.preventDefault();

  //   try {
  //     await logout();
  //     window.location.href = "/login";
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex items-center justify-between ">
          <div className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4 flex items-center gap-4">
            <Avatar className="cursor-pointer h-8 w-8">
              <AvatarImage src={auth?.currentUser?.photoURL} alt="@shadcn" />
              <AvatarFallback>MT</AvatarFallback>
            </Avatar>
            <ToggleTheme />
          </div>
        </header>
        <Separator />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
