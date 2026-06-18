"use client";

import dynamic from "next/dynamic";
import { CustomBuildFormSkeleton } from "./CustomBuildFormSkeleton";

const CustomBuildFormPanel = dynamic(
  () =>
    import("./CustomBuildForm").then((m) => ({
      default: m.CustomBuildForm,
    })),
  { loading: () => <CustomBuildFormSkeleton />, ssr: false },
);

export function LazyCustomBuildForm() {
  return <CustomBuildFormPanel />;
}
