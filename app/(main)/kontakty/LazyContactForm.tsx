"use client";

import dynamic from "next/dynamic";
import { ContactFormSkeleton } from "./ContactFormSkeleton";

const ContactFormPanel = dynamic(
  () =>
    import("./ContactForm").then((m) => ({
      default: m.ContactForm,
    })),
  { loading: () => <ContactFormSkeleton />, ssr: false },
);

export function LazyContactForm() {
  return <ContactFormPanel />;
}
