import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";


export const metadata: Metadata = {
  title: "JIRA Automation",
  description: "Tool to automate tedious JIRA tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          expand
          visibleToasts={5}
        />
      </body>
    </html>
  );
}