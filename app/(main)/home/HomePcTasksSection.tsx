import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/shared/Reveal";
import ArrowIcon from "@/components/icons/ArrowIcon";
import { getHomePcTasks } from "@/lib/sanity/homePcTasksSection";

export async function HomePcTasksSection() {
  const pcTasks = await getHomePcTasks();
  if (pcTasks.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[15px] bg-surface/30 lg:rounded-[40px]">
      <div className="lg:hidden absolute -z-10 bottom-[-20px] left-[-200px] h-[347px] w-[618px]">
        <Image
          src="/images/home/use-cases/bottom-shadows-mob.webp"
          alt=""
          width={618}
          height={347}
          fetchPriority="low"
          className="object-cover"
        />
      </div>

      <div className="lg:hidden absolute -z-10 bottom-[-80px] right-[-260px] h-[436px] w-[686px]">
        <Image
          src="/images/home/use-cases/bottom-decor-mob.webp"
          alt=""
          width={686}
          height={436}
          fetchPriority="low"
          className="object-cover"
        />
      </div>

      <div className="absolute -z-20 bottom-[-529px] right-[-559px] h-[735px] w-[735px] rounded-full bg-[#005996] blur-[255px]" />

      <div className="relative container-site pb-20 pt-[200px] lg:max-w-[825px] lg:pb-[109px] lg:pt-[213px]">
        <div className="hidden lg:block absolute -z-10 bottom-[-600px] left-[-1130px] h-[1253px] w-[1631px]">
          <Image
            src="/images/home/use-cases/bottom-shadows-desk.webp"
            alt=""
            width={1631}
            height={1253}
            fetchPriority="low"
            className="object-cover"
          />
        </div>
        <div className="lg:hidden absolute -z-10 left-[calc(50%-180px)] top-[50px] h-[450px] w-[360px]">
          <Image
            src="/images/home/use-cases/top-image-mob.webp"
            alt=""
            width={360}
            height={450}
            fetchPriority="low"
            className="object-cover"
          />
        </div>
        <div className="hidden lg:block absolute -z-20 left-[calc(50%-840px)] top-[30px] h-[916px] w-[890px]">
          <Image
            src="/images/home/use-cases/top-left-image-desk.webp"
            alt=""
            width={890}
            height={916}
            fetchPriority="low"
            className="object-cover"
          />
        </div>
        <div className="hidden lg:block absolute -z-10 right-[calc(50%-960px)] top-[-20px] h-[803px] w-[1430px]">
          <Image
            src="/images/home/use-cases/top-right-image-desk.webp"
            alt=""
            width={1430}
            height={803}
            fetchPriority="low"
            className="object-cover"
          />
        </div>

        <div className="hidden lg:block absolute -z-20 bottom-[-624px] right-[calc(50%-1260px)] h-[1500px] w-[1607px]">
          <Image
            src="/images/home/use-cases/bottom-right-shadows-desk.webp"
            alt=""
            width={1607}
            height={1500}
            fetchPriority="low"
            className="object-cover"
          />
        </div>
        <div className="hidden lg:block absolute -z-20 right-[calc(50%-310px)] top-0 h-[1133px] w-[733px] rounded-full bg-black blur-[105px]" />

        <Reveal>
          <SectionHeader
            kicker="Під задачу"
            title="ДЛЯ ЯКИХ ЗАДАЧ ЗБИРАЄМО ПК"
            titleClassName="mt-2.5"
          />
        </Reveal>
        <Reveal delay={80}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {pcTasks.map((task) => (
              <Link
                key={task.href}
                href={task.href}
                className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/15"
              >
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                  <Image
                    src={task.iconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                  />
                </div>
                <div className="relative flex-1 font-heading text-[14px] uppercase leading-[120%]">
                  {task.name}
                </div>
                <div className="relative flex size-9 items-center justify-center rounded-full bg-white text-black transition duration-300 ease-out group-hover:translate-x-0.5">
                  <ArrowIcon />
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
