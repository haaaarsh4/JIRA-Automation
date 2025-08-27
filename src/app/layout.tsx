import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "JIRA Automation",
  description: "Tool to automate tedious JIRA tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        {children}
      </body>
    </html>
  );
}
