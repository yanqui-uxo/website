const smiles = [":)", "'u'", "(:", ".n."];
const cuteSmiles = [":3", "'w'", "ε:", ".m."];
const delay = 250;

const smileElement = document.querySelector("#smile")!;
let count = 0;

function loop() {
  const index = count % smiles.length;
  const smile = Math.random() > 0.1 ? smiles[index] : cuteSmiles[index];
  smileElement.textContent = smile;
  document.title = smile;
  count++;
  setTimeout(loop, Math.max(delay - (1 / 120) * count ** 2, delay / 10));
}
loop();
