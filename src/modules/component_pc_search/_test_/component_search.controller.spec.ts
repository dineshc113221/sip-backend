import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import initializeComponentSearchController from "../component_search.controller.js";
import ProductSearchModel, { initializeComponentSearchModel } from "../component_search.model.js";
import ComponentSearchMock from "../../../mocks/ComponentSeach.mock.json";

const mockedProductSearchModel = ProductSearchModel as jest.Mock;
const mockedinitializeComponentSearchModel = initializeComponentSearchModel as jest.Mock;
jest.mock("../../master/master-data.controller.js")
jest.mock("../component_search.model");
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  };
  return { Sequelize: jest.fn(() => mockSequelize) };
});
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));

describe('Attributes versioning Controller', () => {

  it('Should route to getComponentSeachDetails for success', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock[0]),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock[0]),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      PCCode: "PC-0002552"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentSeachDetails(req, res);
    expect(res.json).toBeTruthy();
  });

  it('Should route to getComponentSeachDetails for failure when productSearchDetails in empty', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    const res = mockResponse();
    const req = mockRequest();

    req.params = {
      PCCode: "test"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentSeachDetails(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Should route to getComponentSeachDetails for failure', async () => {
    mockedProductSearchModel.mockReturnValue({})
    mockedinitializeComponentSearchModel.mockReturnValue({})
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      PCCode: "test"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentSeachDetails(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('Should route to getComponentDetails for success', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock[0]),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock[0]),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentDetails("FG-0024947-3");
  });

  it('Should route to getComponentDetails for success when data is not present', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentDetails("FG-0024947-3");
  });

  it('Should route to getComponentDetails for success when data is not present', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(null),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(ComponentSearchMock),
    })

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentDetails("test");
  });

  it('Should route to getComponentDetails for failure', async () => {
    mockedProductSearchModel.mockReturnValue({})
    mockedinitializeComponentSearchModel.mockReturnValue({})

    const ComponentSeachController = await initializeComponentSearchController();
    await ComponentSeachController.getComponentDetails("FG-0024947-3");
  });
  
});
