import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";

// Sticky, modern storefront header. Mobile nav collapses into a bottom
// bar handled by <MobileNav /> (rendered separately in the layout) so this
// component stays simple and reusable across pages.
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button className="md:hidden" aria-label="القائمة">
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-gradient-to-l from-oman-red to-oman-green bg-clip-text text-transparent">
            متجرنا 🇴🇲
          </span>
        </Link>

        <div className="hidden flex-1 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 md:flex dark:border-neutral-800">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <nav className="mr-auto flex items-center gap-4">
          <Link href="/wishlist" aria-label="المفضلة">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="السلة">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <Link href="/account" aria-label="الحساب">
            <User className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
