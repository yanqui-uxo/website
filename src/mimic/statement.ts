export const colors = ["red", "blue", "black"] as const;
export type Color = (typeof colors)[number];

export type Chest = {
  color: Color;
  mimic: boolean;
};

export type Statement = (
  chests: Chest[][],
  position: [number, number]
) => string | null;

function colorStatement(color: Color): Statement {
  return (chests, _) => {
    return chests.flat().some((c) => c.color === color && c.mimic)
      ? `There is a Mimic among the ${color} boxes`
      : `There is no Mimic among the ${color} boxes`;
  };
}
