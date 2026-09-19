export type ActivityCompanion = {
  src: string;
  alt: string;
};

const activityCompanions: ActivityCompanion[] = [
  { src: "/characters/tactile/moose.png", alt: "Friendly moose companion" },
  { src: "/characters/tactile/bison.png", alt: "Friendly bison companion" },
  {
    src: "/characters/tactile/caribou.png",
    alt: "Friendly caribou companion",
  },
  {
    src: "/characters/tactile/red-fox.png",
    alt: "Friendly red fox companion",
  },
  { src: "/characters/tactile/beaver.png", alt: "Friendly beaver companion" },
  {
    src: "/characters/tactile/grizzly-bear.png",
    alt: "Friendly grizzly bear companion",
  },
];

export const getActivityCompanion = (key: string): ActivityCompanion => {
  let hash = 0;

  for (const character of key) {
    hash = (hash * 31 + character.codePointAt(0)!) | 0;
  }

  return activityCompanions[Math.abs(hash) % activityCompanions.length];
};
