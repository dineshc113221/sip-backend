import { connections, closeConnections } from "../daoDBConts.js";
 
jest.mock("mongoose", () => {
  const events = {};
  return {
    createConnection: jest.fn(() => ({
      asPromise: jest.fn().mockResolvedValue({
        on: jest.fn((event, cb) => {
          events[event] = cb;
        }),
        once: jest.fn((event, cb) => {
          events[event] = cb;
        }),
        close: jest.fn().mockResolvedValue(undefined),
      }),
    })),
  };
});
 
describe("MongoDB connection", () => {
  it("should connect to the database", async () => {
    const conn = await connections.mainDb;
    expect(conn.once).toHaveBeenCalledWith("open", expect.any(Function));
  });
 
  it("should close all connections", async () => {
    const conn = await connections.mainDb;
    await closeConnections();
    expect(conn.close).toHaveBeenCalled();
  });
});
