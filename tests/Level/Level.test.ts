import Level from '../../src/Level/Level';

describe('Level', () => {
    describe('parse', () => {
        test('should parse a square map string', () => {
            const map = new Level(`
                1 1 1
                1 0 1
                1 1 1
            `);

            map.parse();

            expect(map.getParsedMap()).toEqual([
                {
                    x: 0,
                    y: 0,
                    entity: 1
                },
                {
                    x: 1,
                    y: 0,
                    entity: 1
                },
                {
                    x: 2,
                    y: 0,
                    entity: 1
                },
                {
                    x: 0,
                    y: 1,
                    entity: 1
                },
                {
                    x: 1,
                    y: 1,
                    entity: 0
                },
                {
                    x: 2,
                    y: 1,
                    entity: 1
                },
                {
                    x: 0,
                    y: 2,
                    entity: 1
                },
                {
                    x: 1,
                    y: 2,
                    entity: 1
                },
                {
                    x: 2,
                    y: 2,
                    entity: 1
                }
            ]);
        });

        test('should parse an oblong map string', () => {
            const map = new Level(`
                1 1 1
                1 0 1
                1 0 1
                1 1 1
            `);

            map.parse();

            expect(map.getParsedMap()).toEqual([
                {
                    x: 0,
                    y: 0,
                    entity: 1
                },
                {
                    x: 1,
                    y: 0,
                    entity: 1
                },
                {
                    x: 2,
                    y: 0,
                    entity: 1
                },
                {
                    x: 0,
                    y: 1,
                    entity: 1
                },
                {
                    x: 1,
                    y: 1,
                    entity: 0
                },
                {
                    x: 2,
                    y: 1,
                    entity: 1
                },
                {
                    x: 0,
                    y: 2,
                    entity: 1
                },
                {
                    x: 1,
                    y: 2,
                    entity: 0
                },
                {
                    x: 2,
                    y: 2,
                    entity: 1
                },
                {
                    x: 0,
                    y: 3,
                    entity: 1
                },
                {
                    x: 1,
                    y: 3,
                    entity: 1
                },
                {
                    x: 2,
                    y: 3,
                    entity: 1
                }
            ]);
        });
    });

    describe('getDestination', () => {
        let level: Level;

        beforeEach(() => {
            level = new Level(`
                1 1 1 1 1
                1 0 0 0 1
                1 0 0 0 1
                1 0 0 0 1
                1 1 1 1 1
            `);

            level.parse();
        });

        test('should get the destination when moving right', () => {
            expect(level.getDestination([1, 1], [1, 0], )).toEqual({
                x: 3, y: 1, entity: 0
            });
        });

        test('should get the destination when moving left', () => {
            expect(level.getDestination([3, 1], [-1, 0], )).toEqual({
                x: 1, y: 1, entity: 0
            });
        });

        test('should get the destination when moving up', () => {
            expect(level.getDestination([1, 3], [0, -1], )).toEqual({
                x: 1, y: 1, entity: 0
            });
        });

        test('should get the destination when moving right', () => {
            expect(level.getDestination([1, 1], [0, 1], )).toEqual({
                x: 1, y: 3, entity: 0
            });
        });
    });
});
