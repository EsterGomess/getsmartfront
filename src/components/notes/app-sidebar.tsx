"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, Settings } from "lucide-react";
import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarHeader, SidebarFooter, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppLogo } from "@/components/layout/app-logo";

const items = [
    { title: "All notes", url: "/notes", icon: FileText },
    { title: "New note", url: "/notes/new", icon: Plus },
    { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row items-center justify-between p-2">
                <div className="flex items-center gap-2 px-2">
                    <AppLogo size={20} className="h-5 w-5" />
                    <span className="text-sm font-semibold">Ideiateca</span>
                </div>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-between p-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm">Sign out</Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
