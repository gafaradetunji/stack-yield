import request from 'supertest';
import { app } from '../stack-yield-backend/src/app.ts';

describe("Withdrawals API", () => {
  it("returns 400 if deposit invalid", async () => {
    const res = await request(app)
      .post("/withdrawals")
      .send({ depositId: "bad-id" });

    expect(res.status).toBe(400);
  });
});
