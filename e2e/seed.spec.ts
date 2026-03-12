import { test, expect } from './fixtures';

test.describe('Environment seed', () => {
  test('resets db and seeds via authenticated api', async ({ seedConfig, db }) => {
    test.skip(!seedConfig.ready, seedConfig.reason);

    const health = await db.health();
    expect(health.ok(), 'DB health endpoint failed').toBeTruthy();

    const reset = await db.reset();
    expect(reset.ok(), 'DB reset endpoint failed').toBeTruthy();

    const seedPayload = {
      source: 'playwright-seed',
      timestamp: new Date().toISOString(),
      entities: {
        users: [
          {
            email: 'seed.user@example.com',
            role: 'admin',
          },
        ],
      },
    };

    const seed = await db.seed(seedPayload);
    expect(seed.ok(), 'DB seed endpoint failed').toBeTruthy();
  });
});
