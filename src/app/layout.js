import "./globals.css";

export const metadata = {
  title: "Criação de Sites Premium & Briefing Interativo",
  description: "Soluções digitais premium sob medida. Conheça meu portfólio ou envie um briefing detalhado do seu projeto online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
