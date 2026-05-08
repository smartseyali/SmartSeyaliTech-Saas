import Link from "next/link";
import { getTenant } from "@/lib/tenant";

export default function NotFound() {
  const tenant = getTenant();

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-24">
      <div className="text-8xl font-extrabold text-brand opacity-20 select-none mb-4">404</div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Sorry, the page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="h-11 px-6 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/shop/"
          className="h-11 px-6 rounded-full border border-brand text-brand text-sm font-semibold hover:bg-brand-50 transition-colors"
        >
          Browse {tenant.brandName}
        </Link>
      </div>
    </main>
  );
}
