import {
  Cpu,
  Gpu,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Fan,
  Plug,
  Package,
  MonitorPlay,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Build, ComponentCategory } from "@/types/build";

const ICON: Record<ComponentCategory, LucideIcon> = {
  cpu: Cpu,
  gpu: Gpu,
  ram: MemoryStick,
  ssd: HardDrive,
  hdd: HardDrive,
  motherboard: CircuitBoard,
  cooling: Fan,
  psu: Plug,
  case: Package,
  os: MonitorPlay,
};

const CATEGORY_LABEL: Record<ComponentCategory, string> = {
  cpu: "Процесор",
  gpu: "Відеокарта",
  ram: "Оперативна пам'ять",
  ssd: "Накопичувач SSD",
  hdd: "Жорсткий диск HDD",
  motherboard: "Материнська плата",
  cooling: "Охолодження",
  psu: "Блок живлення",
  case: "Корпус",
  os: "Операційна система",
};

function warrantyLabel(months: number): string {
  if (months >= 9999) return "Необмежено";
  if (months >= 12) return `${Math.floor(months / 12)} р.`;
  return `${months} міс.`;
}

export function ComponentList({ build }: { build: Build }) {
  return (
    <div className="flex flex-col gap-3">
      {build.components.map((c, i) => {
        const Icon = ICON[c.category];
        return (
          <div
            key={`${c.category}-${i}`}
            className="grid gap-3 rounded-lg border border-border bg-surface p-5 md:grid-cols-[160px_1fr_auto] md:items-center md:gap-6"
          >
            <div className="flex gap-3 flex-col items-start md:gap-1.5 mb-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                <Icon
                  className="size-5 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:whitespace-nowrap">
                {CATEGORY_LABEL[c.category]}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-heading text-[18px] font-semibold leading-tight uppercase">
                {c.displayName}
              </div>
              <p className="mt-3 text-[14px] leading-[120%] text-muted-foreground">
                {c.humanDescription}
              </p>
            </div>
            <div className="flex shrink-0 w-fit items-center gap-1.5 self-start rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground md:self-center">
              <Shield className="size-3.5" strokeWidth={2} />
              <span className=" font-medium text-foreground">
                {warrantyLabel(c.warrantyMonths)}
              </span>
              <span>гарантії</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
