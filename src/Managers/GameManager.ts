import Level from '../Level/Level';

export default class GameManager {
    private score: number = 0;
    private scoreBuffer: number = this.score;
    private maxFeet: number = 10000;
    private feetBuffer: number = this.maxFeet;
    private feetPerSquare: number = 0;
    private feet: number = this.maxFeet;
    private level: Level;

    constructor (
        private game: Phaser.Game
    ) {}

    public setup (
        level: Level
    ): void {
        this.level = level;
        this.feetPerSquare = this.maxFeet / (this.level.getLevelLength() - 2);
    }

    public updateFeetBuffer (y: number) {
        this.feetBuffer = this.maxFeet - (y - 1) * this.feetPerSquare;
    }

    public updateFeet (callback: () => void): void {
        const tween = this.game.add.tween(this);

        tween.to({ feet: this.feetBuffer}, 500, Phaser.Easing.Cubic.Out, false);
        tween.onUpdateCallback(callback.bind(this));
        tween.onComplete.add(() => {
            this.feet = this.feetBuffer;
        });

        tween.start();
    }

    public getFeet (): string {
        return `${this.feet.toFixed(0)}ft`;
    }

    public reset () {
        this.scoreBuffer = 0;
        this.score = 0;
        this.feetBuffer = this.maxFeet;
        this.feetBuffer = this.maxFeet;
    }

    public updateScore (callback: () => void): void {
        const tween = this.game.add.tween(this);

        tween.to({ score: this.scoreBuffer }, 500, Phaser.Easing.Cubic.Out, false);
        tween.onUpdateCallback(callback.bind(this));
        tween.onComplete.add(() => {
            this.score = this.scoreBuffer;
        });
        tween.start();
    }

    public updateScoreBuffer (score: number): void {
        this.scoreBuffer += score;
    }

    public getScore (): string {
        return `$${this.score.toFixed(0)}`;
    }
}
