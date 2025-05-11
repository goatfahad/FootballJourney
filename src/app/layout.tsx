import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"; // Assuming @ is src
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Journey",
  description: "Next Gen Football Management Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
