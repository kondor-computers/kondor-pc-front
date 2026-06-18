/** Normalized city/settlement for checkout autocomplete. */
export interface NpCity {
  /** CityRef for `getWarehouses` (DeliveryCity from Nova Poshta). */
  ref: string;
  name: string;
  region: string;
}

export interface NpBranch {
  ref: string;
  number: string;
  address: string;
}
