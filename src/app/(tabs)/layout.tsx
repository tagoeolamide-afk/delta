import { TabBar } from "@/components/chrome";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
