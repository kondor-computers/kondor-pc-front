import { vega } from "./vega";
import { nebula } from "./nebula";
import { orbitra } from "./orbitra";
import type { Build } from "../../types/build";

export { vega, nebula, orbitra };
export const allBuilds: Build[] = [vega, nebula, orbitra];
