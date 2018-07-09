export interface LevelCoord {
    x: number;
    y: number;
    entity: number;
}

export type ParsedLevel = LevelCoord[];

export default class Level {
    private parsedLevel: ParsedLevel;

    constructor (
        private map: string
    ) {}

    public getParsedMap (): ParsedLevel {
        return this.parsedLevel;
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
                rowCoords.push({ x, y, entity });
                x++;
            });

            parsedMap = [...parsedMap, ...rowCoords];

            y++;
            x = 0;

            return parsedMap;
        }, []);
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

        return this.getCoord(start);
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
