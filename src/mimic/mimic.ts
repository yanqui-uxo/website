import type { Chest, StatementDescription } from "./statement_description.ts";
import {
  colorStatement,
  colors,
  columnStatement,
  evaluateStatementDescription,
  relativePositionStatement,
  relativePositions,
  rowStatement,
} from "./statement_description.ts";

import Alpine from "alpinejs";
import _ from "lodash";

const width = 3;
const height = 3;
const mimicCount = 2;

function generateChests(
  width: number,
  height: number,
  mimicCount: number
): Chest[][] {
  let chests: Chest[][] = [];
  let mimicIndices = _.sampleSize(_.range(0, width * height), mimicCount);

  let index = 0;
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        color: _.sample(colors),
        isMimic: mimicIndices.includes(index),
      });

      index++;
    }
    chests.push(row);
  }

  return chests;
}

function assignStatements(
  chests: Chest[][],
  statementDescriptions: StatementDescription[]
) {
  for (let y = 0; y < chests.length; y++) {
    for (let x = 0; x < chests[y]!.length; x++) {
      const statements = statementDescriptions
        .map((s) => evaluateStatementDescription(s, chests, [x, y]))
        .filter((x) => x !== null);
      chests[y]![x]!.statement = _.sample(statements)!;
    }
  }
}

function generate(width: number, height: number, mimicCount: number) {
  const chests = generateChests(width, height, mimicCount);
  assignStatements(chests, [
    ...colors.map(colorStatement),
    ..._.range(0, height).map(rowStatement),
    ..._.range(0, width).map(columnStatement),
    // lord forgive me
    ...(Object.keys(relativePositions) as any).map(relativePositionStatement),
  ]);
  Alpine.store("chests", chests);
  Alpine.store("width", width);
  Alpine.store("height", height);
  Alpine.store("mimicCount", mimicCount);
}

generate(3, 3, 2);

Alpine.store("generate", generate);
Alpine.start();
