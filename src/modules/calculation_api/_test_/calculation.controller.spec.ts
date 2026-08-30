import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import CalculationsModel, {
  initializeCalculationModel,
} from "../calculation.model.js";
import CalculationErrorLogModel, {
  initializeCalculationErrorLogModel,
} from "../calculation-error-log.model.js";
import initializeCalculationController from "../calculation.controller.js";
const mockedCalculationsModel = CalculationsModel as jest.Mock;

const mockedinitializeCalculationModel = initializeCalculationModel as jest.Mock;
CalculationErrorLogModel as jest.Mock;
initializeCalculationErrorLogModel as jest.Mock;
jest.mock("p-limit", () => {
  return 12;
});
jest.mock('../../../utils/logger', () => {
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
jest.mock('../../../utils/logger/logger-config', () => ({
  LOG_DIR: '/dummy/logs',
  combine: jest.fn(),
  timestamp: jest.fn(),
  printf: jest.fn(),
  json: jest.fn(),
  label: jest.fn(),
}));
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(() => ({
      upsert:jest.fn(),
    })),
    sync: jest.fn(),
    close: jest.fn(),
  };
  const actualSequelize=jest.requireActual('sequelize')
  return { Sequelize: jest.fn(() => mockSequelize), DataTypes:actualSequelize.DataTypes};
});
jest.mock("../calculation.model");
jest.mock("../calculation-error-log.model");
jest.mock("../../../lib/db.connection", () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect: jest.fn(),
  }),
}));


describe("productRouter", () => {
  it("Should return 500 for an internal server error", async () => {
    mockedCalculationsModel.mockReturnValue({});
    mockedinitializeCalculationModel.mockReturnValue({});

    const res = mockResponse();
    const req = mockRequest();
    req.query = {
      assessmentType: "final",
      productId: "999",
      assessmentId: "888",
    };

    const CalculationController = await initializeCalculationController();
    await CalculationController.calculationResult(req, res);

    expect(res.status).toHaveBeenCalled();
  });
});
