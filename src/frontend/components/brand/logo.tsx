import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`logo ${compact ? "logo--compact" : ""}`} aria-label="QLEAR ホーム">
      <Image
        className="logo__image"
        src="/qlear-logo.png"
        alt=""
        width={1536}
        height={1024}
        unoptimized
      />
    </Link>
  );
}
