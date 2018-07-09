import GameManager from '../Managers/GameManager';

export interface LevelCoord {
    x: number;
    y: number;
    entity: number;
    value: number;
    spent: boolean;
}

export type ParsedLevel = LevelCoord[];

export default class Level {
    private parsedLevel: ParsedLevel;
    private levelLength: number;
    private destroyedEntities: LevelCoord[] = [];
    private avalanche: boolean = false;

    constructor (
        private gameManager: GameManager,
        private map: string
    ) {}

    public getParsedMap (): ParsedLevel {
        return this.parsedLevel;
    }

    public getAvalanche (): boolean {
        return this.avalanche;
    }

    public startAvalanche (): void {
        this.avalanche = true;
    }

    public stopAvalanche (): void {
        this.avalanche = false;
    }

    public getLevelLength (): number {
        return this.levelLength;
    }

    public parse (): void {
        let x: number = 0;
        let y: number = 0;

        const splitMap: number[][] = this.map.trim()
            .split('\n')
            .map((row: string) => row.trim())
            .map((row: string) =>
                row.split(' ').map((entity: string) =>
                    parseInt(entity, 10)));

        this.parsedLevel = splitMap.reduce((parsedMap: ParsedLevel, row: number[]) => {
            const rowCoords: LevelCoord[] = [];

            row.forEach((entity: number) => {
                let value: number = 0;

                if (entity === 4) {
                    value = 150;
                }

                rowCoords.push({ x, y, entity, value, spent: false });
                x++;
            });

            parsedMap = [...parsedMap, ...rowCoords];

            y++;
            x = 0;

            return parsedMap;
        }, []);

        // Set length / number of rows
        this.levelLength = y;
    }

    public getDestination (
        start: [number, number],
        direction: [number, number]
    ): LevelCoord {
        const [dx, dy] = direction;

        // If we haven't moved, return the start
        if (dx === 0 && dy === 0) {
            return this.getCoord(start);
        }

        const next: LevelCoord = this.getNextTile(start, direction);

        if (next === undefined) {
            return this.getCoord(start);
        }

        if (next.entity === 0) {
            return this.getDestination([next.x, next.y], direction);
        }

        // GOAL!
        if (next.entity === 3) {
            return next;
        }

        // COIN!
        if (next.entity === 4) {
            if (!next.spent) {
                this.gameManager.updateScoreBuffer(next.value);
                next.spent = true;
                this.destroyedEntities.push(next);
            }

            return this.getDestination([next.x, next.y], direction);
        }

        return this.getCoord(start);
    }

    public reset () {
        this.destroyedEntities = [];
        this.avalanche = false;
        this.parsedLevel.forEach((coord: LevelCoord) => {
            coord.spent = false;
        });
    }

    public clearDestroyedEntities (): LevelCoord[] {
        const entities: LevelCoord[] = [...this.destroyedEntities];

        this.destroyedEntities = [];

        return entities;
    }

    private getNextTile (
        start: [number, number],
        direction: [number, number]
    ): LevelCoord|undefined {
        const [sx, sy] = start;
        const [dx, dy] = direction;
        const target: [number, number] = [sx + dx, sy + dy];

        return this.getCoord(target);
    }

    private getCoord (coord: [number, number]): LevelCoord {
        const [cx, cy] = coord;

        return this.parsedLevel.find((c: LevelCoord) => {
            return c.x === cx && c.y === cy;
        });
    }
}
