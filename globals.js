/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Area, Entity, GameState } from './classes.js';

/** @type {canvas} */
globalThis.canvas = document.querySelector('#gameCanvas');
globalThis.ctx = canvas.getContext('2d');

globalThis.testingMode = false;

globalThis.areas = [ // TODO: convert to object
  new Area('Mercury', '#666666', 2000, new Entity({ color: 'gray', baseSpeed: 200, height: 20 })),
  new Area('Venus', '#FFB347', 2250, new Entity({ color: 'orange', baseSpeed: 215, height: 35 })),
  new Area('Earth', '#4B9CD3', 2500, new Entity({ color: 'brown', baseSpeed: 200, height: 45 })),
  new Area('Mars', '#CC3300', 2750, new Entity({ color: 'white', baseSpeed: 235, height: 40 })),
  new Area('Jupiter', '#D2B48C', 3000, new Entity({ color: 'beige', baseSpeed: 265, height: 50 })),
  new Area('Saturn', '#F0E68C', 3250, new Entity({ color: 'goldenrod', baseSpeed: 250, height: 45 })),
  new Area('Uranus', '#AFEEEE', 3500, new Entity({ color: 'lightblue', baseSpeed: 280, height: 40 })),
  new Area('Neptune', '#4169E1', 3750, new Entity({ color: 'blue', baseSpeed: 300, height: 40 })),
  new Area('Sun', '#FF4500', 4000, new Entity({ color: 'black', baseSpeed: 350, height: 50 }))
];

globalThis.blackHole = new Area('Black Hole', '#000000', 1.2, new Entity('#222222', 10, 60));

globalThis.score = 0;
globalThis.persistentScore = score;
globalThis.level = 1;
globalThis.gameState = GameState.playing;