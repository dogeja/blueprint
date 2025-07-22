import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/components/onboarding-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "靑寫眞 - 인생의 푸른 설계도",
  description: "매일의 작은 걸음으로 마라톤 완주하기",
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
            <OnboardingProvider>
              <div className='w-full min-h-screen px-2 sm:px-4'>{children}</div>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
