import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Building2 } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import {
  formatIbanDisplay,
  getPaymentRequisites,
} from "@/lib/sanity/paymentRequisites";

export async function RequisitesSection() {
  const paymentRequisites = await getPaymentRequisites();

  return (
    <section className="relative container-site py-[92px] lg:py-30">
      <div className="absolute -z-50 top-[-206px] lg:top-[-154px] right-[-510px] lg:left-[-120px] w-[1929px] h-[2007px] rotate-15 pointer-events-none">
        <Image
          src="/images/pk/shadows.svg"
          alt=""
          width={1929}
          height={2007}
          fetchPriority="low"
          className="object-cover"
        />
      </div>

      <Reveal>
        <SectionHeader
          kicker="Юридична інформація"
          title="РЕКВІЗИТИ"
          titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10"
        />
      </Reveal>
      <Reveal>
        <div className="rounded-lg border border-border bg-surface p-6">
          {paymentRequisites ? (
            <div className="flex items-start gap-3">
              <Building2
                className="mt-1 size-5 shrink-0 text-muted-foreground"
                strokeWidth={1.5}
              />
              <div className="grid gap-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Продавець: </span>
                  <span className="font-medium">{paymentRequisites.seller}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    ЄДРПОУ/РНОКПП:{" "}
                  </span>
                  <span className="tabular font-medium">
                    {paymentRequisites.edrpouOrRnokpp}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">IBAN: </span>
                  <span className="tabular">
                    {formatIbanDisplay(paymentRequisites.iban)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Реквізити тимчасово недоступні. Напишіть нам у Telegram — надішлемо
              дані для оплати.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
            <Link
              href="/legal/publichna-oferta"
              className="text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              Публічна оферта
            </Link>
            <Link
              href="/legal/politika-konfidentsiynosti"
              className="text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              Політика конфіденційності
            </Link>
            <Link
              href="/legal/pravova-informatsiya"
              className="text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              Правова інформація
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
