import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Settings, Upload } from "lucide-react";

// middleware.ts already blocks non-admins from ever reaching this layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/products", label: "المنتجات", icon: Package },
    { href: "/admin/products/import", label: "استيراد منتج", icon: Upload },
    { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-l border-neutral-200 p-4 md:block dark:border-neutral-800">
        <p className="mb-6 font-bold">لوحة تحكم المتجر</p>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-oman-gold/10"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
