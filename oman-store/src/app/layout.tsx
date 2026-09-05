import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "متجرنا | تسوق أونلاين في عُمان",
  description: "متجر إلكتروني عماني حديث — منتجات مختارة بأسعار مناسبة وتوصيل داخل السلطنة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="bg-white text-oman-ink antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
