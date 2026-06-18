import { z } from "zod";

const PHONE_REGEX = /^\+380\d{9}$/;

export const DELIVERY_METHODS = [
  "np_branch",
  "np_courier",
  "self_pickup",
] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const PAYMENT_METHODS = [
  "cod",
  "monopay",
  "monobank_parts",
  "privat_parts",
  "pumb_parts",
  "iban_individual",
  "iban_business",
  "crypto",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const baseContact = z.object({
  customerName: z
    .string()
    .min(3, "Введіть ім'я та прізвище")
    .refine((v) => v.trim().split(/\s+/).length >= 2, {
      message: "Вкажіть ім'я та прізвище повністю",
    }),
  customerPhone: z
    .string()
    .regex(PHONE_REGEX, "Формат: +380XXXXXXXXX"),
  customerEmail: z.string().email("Перевір формат email"),
});

export const orderSchema = baseContact.extend({
  deliveryMethod: z.enum(DELIVERY_METHODS),
  deliveryCity: z.string().optional(),
  deliveryCityRef: z.string().optional(),
  deliveryBranchNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  customerComment: z.string().max(500).optional().or(z.literal("")),
  consent: z.literal(true, {
    message: "Потрібна згода з офертою",
  }),
}).superRefine((v, ctx) => {
  if (v.deliveryMethod === "np_branch") {
    if (!v.deliveryCity) ctx.addIssue({ code: "custom", path: ["deliveryCity"], message: "Оберіть місто" });
    if (!v.deliveryBranchNumber) ctx.addIssue({ code: "custom", path: ["deliveryBranchNumber"], message: "Оберіть відділення" });
  }
  if (v.deliveryMethod === "np_courier") {
    if (!v.deliveryCity) ctx.addIssue({ code: "custom", path: ["deliveryCity"], message: "Оберіть місто" });
    if (!v.deliveryAddress) ctx.addIssue({ code: "custom", path: ["deliveryAddress"], message: "Вкажіть адресу" });
  }
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const customBuildSchema = baseContact
  .omit({ customerEmail: true })
  .extend({
  customerTelegram: z
    .string()
    .min(2, "Вкажіть нік або номер")
    .max(64, "Занадто довге значення"),
  budgetMin: z.number().int().min(10000),
  budgetMax: z.number().int().max(300000),
  task: z.enum([
    "gaming",
    "gaming_stream",
    "work",
    "universal",
    "other",
  ]),
  games: z.string().max(500).optional().or(z.literal("")),
  wishes: z.string().max(500).optional().or(z.literal("")),
  preferredTime: z.enum(["10-14", "14-18", "18-21", "any"]),
  channel: z.enum(["telegram", "viber", "whatsapp", "phone"]),
});
export type CustomBuildValues = z.infer<typeof customBuildSchema>;
