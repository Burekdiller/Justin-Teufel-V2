/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Area, Entity, GameState } from './classes.js';

/** @type {canvas} */
globalThis.canvas = document.querySelector('#gameCanvas');
globalThis.ctx = canvas.getContext('2d');

globalThis.testingMode = false;

globalThis.areas = [ // TODO: convert to object
  new Area('Mercury', '#666666', 0.4, new Entity({ color: 'gray', baseSpeed: 3, height: 20 })),
  new Area('Venus', '#FFB347', 0.45, new Entity({ color: 'orange', baseSpeed: 3.2, height: 35 })),
  new Area('Earth', '#4B9CD3', 0.5, new Entity({ color: 'brown', baseSpeed: 3, height: 45 })),
  new Area('Mars', '#CC3300', 0.55, new Entity({ color: 'white', baseSpeed: 3.5, height: 40 })),
  new Area('Jupiter', '#D2B48C', 0.6, new Entity({ color: 'beige', baseSpeed: 4, height: 50 })),
  new Area('Saturn', '#F0E68C', 0.65, new Entity({ color: 'goldenrod', baseSpeed: 3.8, height: 45 })),
  new Area('Uranus', '#AFEEEE', 0.7, new Entity({ color: 'lightblue', baseSpeed: 4.2, height: 40 })),
  new Area('Neptune', '#4169E1', 0.75, new Entity({ color: 'blue', baseSpeed: 4.5, height: 40 })),
  new Area('Sun', '#FF4500', 0.8, new Entity({ color: 'black', baseSpeed: 5, height: 50 }))
];

globalThis.blackHole = new Area('Black Hole', '#000000', 1.2, new Entity('#222222', 10, 60));

globalThis.score = 0;
globalThis.persistentScore = score;
globalThis.level = 1;
globalThis.gameState = GameState.playing;