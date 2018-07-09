import 'p2';
import 'pixi';
import 'phaser';
import Graphics = Phaser.Graphics;
import CursorKeys = Phaser.CursorKeys;
import Level, {LevelCoord, ParsedLevel} from './Level/Level';

const game = new Phaser.Game(600, 400, Phaser.AUTO, 'root', {
    create, update, render
});

const UNIT = 25;
const SPEED = 100;

function toUnit (pixel: number) {
    return pixel * UNIT;
}

function fromUnit (pixel: number) {
    return pixel / UNIT;
}

function createPlayer (x: number, y: number) {
    player = game.add.graphics(x, y);
    player.beginFill(0xff0000, 1);
    player.drawRect(0, 0, UNIT, UNIT);
    player.endFill();
    game.physics.enable(player);
    player.body.collideWorldBounds = true;

    return player;
}

// function createObstacle (x: number, y: number, design: string) {
//     let columnIndex: number = 1;
//     let rowIndex: number = 1;
//     let area: number = 0;
//
//     design.match(/\n/g).forEach(() => area++);
//
//     design.trim().split('')
//         .filter((n: string) => n === '0' || n === '1')
//         .map((n: string) => parseInt(n, 10))
//         .forEach((n: number) => {
//             if (n !== 0) {
//                 const cellX = (columnIndex - 1) * UNIT;
//                 const cellY = (rowIndex - 1) * UNIT;
//                 const obs: Graphics = game.add.graphics(x, y);
//
//                 obs.beginFill(0xffffff);
//                 obs.drawRect(cellX, cellY, UNIT, UNIT);
//                 obs.endFill();
//                 game.physics.enable(obs);
//                 obs.body.setSize(UNIT, UNIT, cellX, cellY);
//                 obstacles.push(obs);
//             }
//
//             if (columnIndex !== 0 && columnIndex % (area - 1) === 0) {
//                 columnIndex = 1;
//                 rowIndex++;
//             } else {
//                 columnIndex++;
//             }
//         });
// }

function drawLevel (coords: LevelCoord[]): Graphics[] {
    return coords
        .filter((coord: LevelCoord) => coord.entity !== 0)
        .map((coord: LevelCoord) => {
            const worldX: number = toUnit(coord.x);
            const worldY: number = toUnit(coord.y);
            const tile: Graphics = game.add.graphics(worldX, worldY);

            tile.beginFill(0xffffff);
            tile.drawRect(0, 0, UNIT, UNIT);
            tile.endFill();
            game.physics.enable(tile);
            tile.body.setSize(UNIT, UNIT, 0, 0);

            return tile;
        });
}

let tiles: Graphics[];
const map: string = `
    1 1 1 1 1 1 1 1 1 1
    1 0 0 0 0 1 0 0 1 1
    1 0 0 0 0 1 0 0 0 1
    1 1 0 0 0 0 0 0 1 1
    1 1 1 0 0 0 0 0 0 1
    1 1 0 0 0 0 0 0 0 1
    1 0 0 0 1 0 0 0 0 1
    1 0 0 0 0 0 0 1 0 1
    1 0 1 0 0 0 0 0 0 1
    1 1 1 1 1 1 1 1 1 1
`;

// const level: string = `
//     1 1 1
//     1 0 1
//     1 1 1
// `;

const level: Level = new Level(map);

level.parse();

let player: Graphics;
let cursors: CursorKeys;

function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    player = createPlayer(toUnit(1), toUnit(1));
    cursors = game.input.keyboard.createCursorKeys();

    tiles = drawLevel(level.getParsedMap());
}

function update () {
    let direction: [number, number] = [0, 0];

    if (cursors.left.justUp) {
        direction = [-1, 0];
    }

    if (cursors.right.justUp) {
        direction = [1, 0];
    }

    if (cursors.up.justUp) {
        direction = [0, -1];
    }

    if (cursors.down.justUp) {
        direction = [0, 1];
    }

    const destination: LevelCoord = level.getDestination(
        [fromUnit(player.x), fromUnit(player.y)],
        direction
    );

    player.position.setTo(toUnit(destination.x), toUnit(destination.y));
}

function render () {
    // game.debug.body(player);
    game.debug.bodyInfo(player, 20, 20, 'green');
    tiles.forEach((o: Graphics) => game.debug.body(o));
}
