import Link from "next/link";
import { loginAction } from "@/server/actions/auth";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  return (
    <section className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold">تسجيل الدخول</h1>
      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={searchParams.callbackUrl ?? "/"} />
        <input
          name="email"
          type="email"
          required
          placeholder="البريد الإلكتروني"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="كلمة المرور"
          className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button className="w-full rounded-full bg-oman-red py-3 font-bold text-white">
          دخول
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        ليس لديك حساب؟ <Link href="/register" className="text-oman-green">سجّل الآن</Link>
      </p>
    </section>
  );
}
