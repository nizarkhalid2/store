import Link from "next/link";
import { registerCustomer } from "@/server/actions/auth";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold">إنشاء حساب</h1>
      <form action={registerCustomer} className="space-y-4">
        <input
          name="fullName"
          required
          placeholder="الاسم الكامل"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="البريد الإلكتروني"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="phone"
          required
          placeholder="رقم الهاتف"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="كلمة المرور"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button className="w-full rounded-full bg-oman-green py-3 font-bold text-white">
          إنشاء الحساب
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        لديك حساب بالفعل؟ <Link href="/login" className="text-oman-green">تسجيل الدخول</Link>
      </p>
    </section>
  );
}
