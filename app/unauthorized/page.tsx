import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function UnauthorizedPage() {
  const t = await getTranslations("unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
            alt="Mai Ke Kai"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto"
          />
        </Link>

        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
          {t("title")}
        </h1>

        <p className="text-muted-foreground mb-8">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              {t("backHome")}
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button className="w-full sm:w-auto">{t("login")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
