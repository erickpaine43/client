import Link from "next/link";
import Image from "next/image";

export const Logo = () => (
  <Link
    href="https://penguinmails.com"
    className="flex items-center gap-1 justify-center max-h-8 max-w-48 text-foreground hover:text-muted-foreground transition-colors duration-200"
  >
    <>
      <div className="relative min-h-8 min-w-8">
        <Image
          src="/img/icon.png"
          alt="PenguinMails Logo"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        PenguinMails
      </h1>
    </>
  </Link>
);
