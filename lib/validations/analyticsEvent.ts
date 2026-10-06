import { z } from "zod";

export const SERVER_EVENTS = ["purchase", "start_checkout"] as const;
export type ServerEventName = (typeof SERVER_EVENTS)[number];

const optionalCookie = z.string().max(512).optional();

export const serverEventSchema = z.object({
  event: z.enum(SERVER_EVENTS),
  /** Той самий id, що й у браузерній події (для дедуплікації). */
  eventId: z.string().min(1).max(128),
  value: z.number().nonnegative().max(100_000_000),
  items: z
    .array(
      z.object({
        item_id: z.string().min(1).max(128),
        item_name: z.string().max(512),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive().max(1000),
      }),
    )
    .min(1)
    .max(50),
  phone: z.string().max(32).optional(),
  tracking: z
    .object({
      fbp: optionalCookie,
      fbc: optionalCookie,
      ttp: optionalCookie,
      ttclid: optionalCookie,
      eventSourceUrl: z.string().max(2048).optional(),
    })
    .default({}),
});

export type ServerEventInput = z.infer<typeof serverEventSchema>;
