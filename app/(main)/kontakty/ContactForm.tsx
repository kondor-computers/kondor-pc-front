"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { TG } from "@/lib/telegram/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", phone: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("idle");

    const text =
      `${TG.form} <b>Заявка з контактної форми</b>\n\n` +
      `${TG.name} <b>Ім'я:</b> ${values.name.trim()}\n` +
      `${TG.phone} <b>Телефон:</b> ${values.phone.trim()}\n` +
      `${TG.message} <b>Повідомлення:</b> ${values.message.trim()}`;

    try {
      await sendTelegramMessage(text);
      reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 rounded-lg border border-border bg-surface p-6">
      <div className="grid gap-1">
        <Label className="text-[14px]">Ім&apos;я</Label>
        <Input
          placeholder="Іван Петренко"
          className="text-[14px]"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-1">
        <Label className="text-[14px]">Телефон</Label>
        <Input
          placeholder="+380 95 000 00 00"
          className="text-[14px]"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <div className="grid gap-1">
        <Label className="text-[14px]">Повідомлення</Label>
        <textarea
          rows={4}
          placeholder="Опиши свій запит..."
          className="w-full h-[98px] rounded-md border border-border bg-background px-3 py-2 text-[14px] focus-visible:border-ring focus-visible:outline-none"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        variant="default"
        disabled={isSubmitting}
        className="h-12 w-full px-6 rounded-none normal-case font-body text-[14px] leading-[120%] font-medium tracking-normal"
      >
        {isSubmitting ? "Надсилаємо..." : "Надіслати"}
      </Button>
      {status === "success" && (
        <p className="text-center text-[14px] leading-[120%] text-green-500">
          Повідомлення надіслано. Відповімо протягом робочої години.
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-[14px] leading-[120%] text-destructive">
          Не вдалося надіслати. Спробуй ще раз або напиши нам у Telegram.
        </p>
      )}
      {status === "idle" && (
        <p className="text-center text-[14px] leading-[120%] font-light text-muted-foreground">
          Залиш повідомлення — відповімо протягом робочої години.
        </p>
      )}
    </form>
  );
}
