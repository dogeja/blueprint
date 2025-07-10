import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PPMS - Personal Productivity Management System",
  description: "개인 생산성 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className='w-full min-h-screen px-2 sm:px-4'>{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
