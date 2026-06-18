import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Введіть ім'я"),
  phone: z.string().min(10, "Введіть номер телефону"),
  message: z
    .string()
    .min(10, "Опишіть запит детальніше")
    .max(1000, "Занадто довге повідомлення"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
