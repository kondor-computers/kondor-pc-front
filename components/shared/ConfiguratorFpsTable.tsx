"use client";

import { FpsTable } from "@/components/shared/FpsTable";
import { useProductConfiguratorOptional } from "@/components/shared/ProductConfigurator";
import type { Build } from "@/types/build";

export function ConfiguratorFpsTable({
  build,
  gameShortLabels,
  className,
}: {
  build: Build;
  gameShortLabels?: Record<string, string>;
  className?: string;
}) {
  const config = useProductConfiguratorOptional();
  const fpsBuild = config
    ? { ...build, fps: config.resolvedFps }
    : build;

  return (
    <FpsTable
      build={fpsBuild}
      gameShortLabels={gameShortLabels}
      className={className}
    />
  );
}
