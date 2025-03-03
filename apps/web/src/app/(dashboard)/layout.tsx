import { AppSidebar } from "@/components/app-sidebar"
import { getSessionFromCookie } from "@/utils/auth"
import {
  SidebarInset,
  SidebarProvider,
} from "@repo/ui/components/ui/sidebar"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie()

  if (!session) {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
