import CalculationRouter from "../calculation.routes.js";
import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import CalculationsModel, {
  initializeCalculationModel,
} from "../calculation.model.js";
import CalculationErrorLogModel, {
  initializeCalculationErrorLogModel,
} from "../calculation-error-log.model.js";
import SipinternalAssessments from "../../../mocks/SipinternalAssessments.mock.json";
import express from "express";

const mockedCalculationsModel = CalculationsModel as jest.Mock;
const mockedInitializeCalculationModel = initializeCalculationModel as jest.Mock;
const mockedCalculationErrorLogModel = CalculationErrorLogModel as jest.Mock;
const mockedInitializeCalculationErrorLogModel = initializeCalculationErrorLogModel as jest.Mock;

jest.mock("p-limit", () => {
  return () => 12;
});

jest.mock("../../../utils/logger", () => {
  return {
    __esModule: true,
    default: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      http: jest.fn(),
      transaction: jest.fn(),
    },
  };
});

jest.mock("../../../utils/logger/logger-config", () => ({
  LOG_DIR: "/dummy/logs",
  combine: jest.fn(),
  timestamp: jest.fn(),
  printf: jest.fn(),
  json: jest.fn(),
  label: jest.fn(),
}));

jest.mock("sequelize", () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(() => ({
      upsert: jest.fn(),
    })),
    sync: jest.fn(),
    close: jest.fn(),
  };
  const actualSequelize = jest.requireActual("sequelize");
  return {
    Sequelize: jest.fn(() => mockSequelize),
    DataTypes: actualSequelize.DataTypes,
  };
});

jest.mock("../../../lib/db.connection", () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect: jest.fn(),
  }),
}));

jest.mock("../calculation.model");
jest.mock("../calculation-error-log.model");

describe("CalculationRouter", () => {
  it("Should route to calculationResult", async () => {
    mockedCalculationsModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(SipinternalAssessments[0]),
    });

    mockedInitializeCalculationModel.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(SipinternalAssessments[0]),
    });

    mockedCalculationErrorLogModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({}),
    });

    mockedInitializeCalculationErrorLogModel.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue({}),
    });
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      assessmentType: "baseline",
      productId: "123",
      assessmentId: "456",
    };
    req.header["x-consumer-userId"] = "USERID123";

    const mRouter = {
      get: (path, callback) => {
        if (path === "/result/:assessmentType/:productId/:assessmentId") {
          callback(req, res);
        }
      },
      then: jest.fn(),
    } as never;

    jest.spyOn(express, "Router").mockImplementationOnce(() => mRouter);

    CalculationRouter();
  });
});
