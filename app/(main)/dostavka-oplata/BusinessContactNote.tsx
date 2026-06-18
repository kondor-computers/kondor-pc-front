import { getSiteContactEmail } from "@/lib/sanity/siteContacts";

export async function BusinessContactNote() {
  const contactEmail = await getSiteContactEmail();

  return (
    <p className="mt-5 text-[12px] lg:text-[14px] leading-[120%] text-muted-foreground">
      {contactEmail ? (
        <>
          Для оформлення напиши на{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-foreground underline underline-offset-1"
          >
            {contactEmail}
          </a>{" "}
          або обери «Для ФОП/ЮО» при оформленні замовлення.
        </>
      ) : (
        <>
          Для оформлення обери «Для ФОП/ЮО» при оформленні замовлення або
          зв&apos;яжись з нами через сторінку контактів.
        </>
      )}
    </p>
  );
}
