import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-next",
});

export const metadata = {
  title: "Criação de soluções",
  description: "Soluções digitais sob medida. Conheça meu portfólio e envie um briefing detalhado do seu projeto .",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
