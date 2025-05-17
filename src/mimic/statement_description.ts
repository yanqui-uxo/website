export const colors = ["red", "blue", "green"] as const;
export type Color = (typeof colors)[number];

export type Chest = {
  color: Color;
  isMimic: boolean;
  statement?: string;
};

export type StatementDescription = {
  test: (chests: Chest[][], position: [number, number]) => boolean | null;
  true: string;
  false: string;
};

export function evaluateStatementDescription(
  statementDescription: StatementDescription,
  chests: Chest[][],
  position: [number, number]
): string | null {
  let result = statementDescription.test(chests, position);
  if (result === null) {
    return null;
  }
  if (chests[position[1]]![position[0]]!.isMimic) {
    result = !result;
  }
  return result ? statementDescription.true : statementDescription.false;
}

export const relativePositions = {
  ["above"]: [0, -1],
  ["below"]: [0, 1],
  ["to the left of"]: [-1, 0],
  ["to the right of"]: [1, 0],
} as const;

export function colorStatement(color: Color): StatementDescription {
  return {
    test: (chests, _) =>
      chests.flat().some((c) => c.color === color && c.isMimic),
    true: `There is a Mimic among the ${color} boxes`,
    false: `There is no Mimic among the ${color} boxes`,
  };
}

export function rowStatement(row: number): StatementDescription {
  return {
    test: (chests, _) => chests[row]!.some((c) => c.isMimic),
    true: `There is a Mimic in row #${row + 1}`,
    false: `There is no Mimic in row #${row + 1}`,
  };
}

export function columnStatement(column: number): StatementDescription {
  return {
    test: (chests, _) =>
      chests.map((row) => row[column]).some((c) => c!.isMimic),
    true: `There is a Mimic in column #${column + 1}`,
    false: `There is no Mimic in column #${column + 1}`,
  };
}

export function relativePositionStatement(
  relativePosition: keyof typeof relativePositions
): StatementDescription {
  return {
    test: (chests, position) => {
      const displacement = relativePositions[relativePosition];
      return (
        chests?.[position[1] + displacement[1]]?.[position[0] + displacement[0]]
          ?.isMimic ?? null
      );
    },
    true: `The chest ${relativePosition} this chest is a Mimic.`,
    false: `The chest ${relativePosition} this chest is not a Mimic.`,
  };
}
