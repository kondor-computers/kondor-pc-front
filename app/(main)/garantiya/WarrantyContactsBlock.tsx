import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatPhoneDisplay,
  getSiteContacts,
  phoneHref,
  telegramHref,
} from "@/lib/sanity/siteContacts";
import { MessageSquare, Mail, Phone } from "lucide-react";

export async function WarrantyContactsBlock() {
  const siteContacts = await getSiteContacts();
  if (!siteContacts) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-3 justify-center">
      <a
        href={phoneHref(siteContacts.phone)}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "w-full lg:w-fit px-9",
        )}
      >
        <Phone className="mr-1.5 size-4" />
        {formatPhoneDisplay(siteContacts.phone)}
      </a>
      <a
        href={telegramHref(siteContacts.telegram)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "w-full lg:w-fit px-8",
        )}
      >
        <MessageSquare className="mr-1.5 size-4" />
        Telegram
      </a>
      <a
        href={`mailto:${siteContacts.email}`}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "w-full lg:w-fit px-8",
        )}
      >
        <Mail className="mr-1.5 size-4" />
        Email
      </a>
    </div>
  );
}
