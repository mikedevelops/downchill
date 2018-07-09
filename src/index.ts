import 'p2';
import 'pixi';
import 'phaser';
import Level, {LevelCoord, ParsedLevel} from './Level/Level';
import GameManager from './Managers/GameManager';
import '../fonts/Commodore.ttf';
import '../sprites/snow.png';
import Graphics = Phaser.Graphics;
import CursorKeys = Phaser.CursorKeys;
import Group = Phaser.Group;
import Text = Phaser.Text;
import PhaserTextStyle = Phaser.PhaserTextStyle;
import Sprite = Phaser.Sprite;
import Tween = Phaser.Tween;
import TweenManager = Phaser.TweenManager;

const game = new Phaser.Game(432, 768, Phaser.AUTO, 'root', {
    preload, create, update, render
});

const UNIT = 24;

let player: Sprite;
let cursors: CursorKeys;
let score: Text;
let feet: Text;
let coins: Graphics[];
let levelGroup: Group;

function preload () {
    game.load.spritesheet('snow', 'snow.png', 16, 16);
}

function toUnit (pixel: number) {
    return pixel * UNIT;
}

function fromUnit (pixel: number) {
    return pixel / UNIT;
}

function createPlayer (x: number, y: number) {
    const playerGraphics: Graphics = new Graphics(game, 0, 0);

    playerGraphics.beginFill(0xff0000, 1);
    playerGraphics.drawRect(0, 0, UNIT, UNIT);
    playerGraphics.endFill();
    player = new Phaser.Sprite(game, x, y);

    player.addChild(playerGraphics);

    return player;
}

function drawLevel (parsedLevel: ParsedLevel): Graphics[] {
    return parsedLevel
        .map((coord: LevelCoord) => {
            const worldX: number = toUnit(coord.x);
            const worldY: number = toUnit(coord.y);
            const tile: Graphics = new Graphics(game, worldX, worldY);

            tile.beginFill(entityKey[coord.entity]);
            tile.drawRect(0, 0, UNIT, UNIT);
            tile.endFill();

            return tile;
        });
}

function drawCoins (parsedLevel: ParsedLevel): Graphics[] {
    return parsedLevel
        .filter((coord: LevelCoord) => coord.entity === 4)
        .map((coord: LevelCoord) => {
            const worldX: number = toUnit(coord.x);
            const worldY: number = toUnit(coord.y);
            const coin: Graphics = new Graphics(game, worldX, worldY);
            const size: number = UNIT / 4;

            coin.beginFill(0xFFD700);
            coin.drawEllipse(size * 2, size * 2, size, size);
            coin.endFill();

            return coin;
        });
}

const fontStyle: PhaserTextStyle = {
    font: 'Commodore',
    fontSize: toUnit(0.75),
    fill: 'white'
};

function drawScore (): Group {
    const UI: Group = game.add.group();

    score = new Phaser.Text(game, toUnit(1), toUnit(1), gameManager.getScore(), fontStyle);
    feet = new Phaser.Text(game, toUnit(1), toUnit(2), gameManager.getFeet(), fontStyle);

    UI.add(score);
    UI.add(feet);

    return UI;
}

const entityKey: { [index: string]: number } = {
    0: 0xffffff,
    1: 0xcccccc,
    3: 0x0000ff,
    4: 0xffffff
};

let tiles: Graphics[];

const stage: string = `
    1 0 4 4 4 1 4 4 1 1
    1 0 0 0 0 1 0 0 0 1
    1 1 0 0 0 0 0 0 1 1
    1 1 0 1 1 1 1 4 4 1
    1 1 4 0 0 0 0 4 4 1
    1 0 4 0 1 0 0 4 4 1
    1 0 1 1 1 1 1 1 1 1
    1 0 4 4 4 1 0 0 4 1
    1 1 0 0 4 0 0 0 1 1
    1 1 1 1 4 0 4 0 1 1
    1 0 0 0 4 4 4 0 0 1
    1 0 0 0 0 0 0 1 0 1
    1 1 1 4 4 4 4 1 0 1
    1 1 1 1 1 1 1 1 4 1
    1 0 0 0 0 0 0 1 0 1
    1 4 0 0 0 0 0 0 0 1
    1 4 4 4 4 1 1 1 1 1
    1 1 4 4 4 4 4 4 4 1
    1 1 1 4 4 4 4 4 4 1
    1 4 4 4 4 4 4 4 1 1
`;

const map: string = `
    1 1 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 0 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 0 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 0 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 0 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 0 1 1 1 1 1 1 1 1
    ${stage.trim()}
    1 1 1 3 3 3 3 1 1 1
`;

const gameManager = new GameManager(game);
const level: Level = new Level(gameManager, map);

let firstMove: boolean = false;
let playerCanMove: boolean = true;

level.parse();

function getCoin (coord: LevelCoord): Graphics {
    return coins.find((c: Graphics) => fromUnit(c.x) === coord.x && fromUnit(c.y) === coord.y);
}

function create () {
    levelGroup = game.add.group();

    gameManager.setup(level);

    const UI: Group = drawScore();

    UI.fixedToCamera = true;

    cursors = game.input.keyboard.createCursorKeys();

    tiles = drawLevel(level.getParsedMap());
    tiles.forEach((t: Graphics) => levelGroup.add(t));

    coins = drawCoins(level.getParsedMap());
    coins.forEach((c: Graphics) => levelGroup.add(c));

    levelGroup.position.setTo(toUnit(6), toUnit(4));

    player = createPlayer(toUnit(1), toUnit(1));

    levelGroup.add(player);

    game.world.setBounds(0, 0, game.width, 50000);
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    const emitter = game.add.emitter(game.world.centerX, 0, 1000);

    emitter.width = game.world.width;
    // emitter.angle = 30; // uncomment to set an angle for the rain.

    emitter.makeParticles('snow');

    emitter.minParticleScale = 0.1;
    emitter.maxParticleScale = 0.5;
    emitter.cameraOffset.setTo(toUnit(8), 0);

    emitter.setYSpeed(50, 100);
    emitter.setXSpeed(-5, 5);

    emitter.minRotation = 0;
    emitter.maxRotation = 0;
    emitter.fixedToCamera = true;

    emitter.start(false, 3000, 75, 0);
}

function drawAvalanche () {
    const avalanche: Graphics = game.add.graphics(levelGroup.x, toUnit(0));

    avalanche.beginFill(0x00ff00);
    avalanche.drawRect(0, 0, toUnit(10), toUnit(5));
    avalanche.endFill();
}

function update () {
    let direction: [number, number] = [0, 0];
    let move: boolean = false;
    let shake: number;

    if (cursors.left.justUp) {
        direction = [-1, 0];
        shake = Phaser.Camera.SHAKE_HORIZONTAL;
        move = true;
    }

    if (cursors.right.justUp) {
        direction = [1, 0];
        shake = Phaser.Camera.SHAKE_HORIZONTAL;
        move = true;
    }

    if (cursors.up.justUp) {
        direction = [0, -1];
        shake = Phaser.Camera.SHAKE_VERTICAL;
        move = true;
    }

    if (cursors.down.justUp) {
        direction = [0, 1];
        shake = Phaser.Camera.SHAKE_VERTICAL;
        move = true;
    }

    if (move && playerCanMove) {
        const destination: LevelCoord = level.getDestination(
            [fromUnit(player.x), fromUnit(player.y)],
            direction
        );

        game.camera.shake(0.0025, 150, true, shake);
        player.position.setTo(toUnit(destination.x), toUnit(destination.y));

        gameManager.updateScore(() => {
            score.text = gameManager.getScore();
        });

        gameManager.updateFeetBuffer(destination.y);
        gameManager.updateFeet(() => {
            feet.text = gameManager.getFeet();
        });

        level.clearDestroyedEntities().forEach((coord: LevelCoord, index: number) => {
            setTimeout(() => {
                getCoin(coord).destroy();
            }, index * 150);
        });

        if (destination.entity === 3) {
            win();
        }

        if (!firstMove) {
            startAvalancheTimer();
            firstMove = true;
        }
    }

    if (level.getAvalanche()) {
        game.camera.shake(0.0025, 150, false, Phaser.Camera.SHAKE_BOTH);
    }
}

function startAvalancheTimer () {
    game.time.events.add(game.rnd.integerInRange(15000, 20000), () => {
        let avalancheProgress: number = 0;
        let avalancheSpeed = 1500;
        const panel = drawPanel('AVALANCHE!!!!');

        playerCanMove = false;
        game.camera.shake(0.05, 2000, true, Phaser.Camera.SHAKE_BOTH);

        function progressAvalanche () {
            avalancheProgress++;
            levelGroup.position.setTo(levelGroup.position.x, levelGroup.position.y - toUnit(1));

            if (avalancheProgress >= fromUnit(player.position.y)) {
                lose();
            }

            if (avalancheProgress === level.getLevelLength()) {
                level.stopAvalanche();
            }

            if (level.getAvalanche()) {
                game.time.events.add(avalancheSpeed, progressAvalanche);
                avalancheSpeed = Phaser.Math.clamp(avalancheSpeed - 50, 250, 1000);
            }
        }

        game.time.events.add(2500, () => {
            panel.destroy();
            drawAvalanche();
            level.startAvalanche();
            playerCanMove = true;
            progressAvalanche();
        });
    });
}

function render () {
    // game.debug.body(player);
    game.debug.bodyInfo(player, 20, 20, 'green');
    tiles.forEach((o: Graphics) => game.debug.body(o));
}

function win () {
    level.stopAvalanche();

    drawPanel('You did it! :)\n\nPress SPACEBAR to restart');

    game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
        .onDown.addOnce(() => game.state.restart());
}

function drawPanel (copy: string, padding: number = toUnit(1)) {
    const panel: Group = new Phaser.Group(game);
    const panelGraphic = new Phaser.Graphics(game, 0, 0);
    const style = Object.assign({}, fontStyle, {
        fontSize: toUnit(0.75)
    });
    const text = new Phaser.Text(game, 0, 0, copy, style);

    panelGraphic.beginFill(0x000000);
    panelGraphic.lineStyle(toUnit(0.25), 0xffffff);
    panelGraphic.drawRect(0, 0, toUnit(14), toUnit(7));
    panelGraphic.endFill();

    panel.add(panelGraphic);
    panel.add(text);

    text.x = padding;
    text.y = padding;
    text.align = 'center';
    text.wordWrap = true;
    text.wordWrapWidth = panel.width - (padding * 2);

    panel.cameraOffset.x = toUnit(2);
    panel.cameraOffset.y = toUnit(6);
    panel.fixedToCamera = true;

    return panel;
}

function lose () {
    drawPanel('You were consumed by the avalanche :(\n\nPress SPACEBAR to restart');

    game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
        .onDown.addOnce(() => {
            level.reset();
            firstMove = false;
            gameManager.reset();
            game.state.restart();
    });
}
