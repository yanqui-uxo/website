import Alpine from "alpinejs";
import type { Chest } from "./statement.ts";
import _ from "lodash";
import { colors } from "./statement.ts";

const width = 3;
const height = 3;

function generateChests(width: number, height: number): Chest[][] {
  let chests: Chest[][] = [];
  let mimicIndices = _.sampleSize(_.range(0, width * height), 2);

  let index = 0;
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        color: _.sample(colors),
        mimic: mimicIndices.includes(index),
      });

      index++;
    }
    chests.push(row);
  }

  return chests;
}

Alpine.store("chests", generateChests(width, height));
Alpine.start();
