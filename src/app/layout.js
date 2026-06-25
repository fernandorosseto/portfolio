import "./globals.css";

export const metadata = {
  title: "Criação de soluções",
  description: "Soluções digitais sob medida. Conheça meu portfólio e envie um briefing detalhado do seu projeto .",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
