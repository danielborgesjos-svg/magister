import { LayoutProvider } from "@/components/layout/LayoutProvider"
import { LayoutWrapper } from "@/components/layout/LayoutWrapper"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </LayoutProvider>
  )
}
