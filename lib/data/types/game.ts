export type GameSpecs = {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
};

export type GraphicsSetting = {
  name: string;
  low: string;
  medium: string;
  high: string;
  ultra: string;
  fpsImpact?: string;
};

export type Game = {
  slug: string;
  nameUk: string;
  nameEn: string;
  heroImage: string;
  officialUrl?: string;
  minSpecs: GameSpecs;
  recSpecs: GameSpecs;
  competitiveSpecs?: GameSpecs;
  graphicsSettings: GraphicsSetting[];
  tags: string[];
};
