import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "./common/components/ToastContainer";
import ConfirmContainer from "./common/components/ConfirmContainer";

export const metadata: Metadata = {
  title: "PetLifeLog",
  description: "햇살처럼 따뜻하게 기록하는 우리 아이와의 소중한 일상",
};

import { ThemeProvider } from "./common/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
          <ToastContainer />
          <ConfirmContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
