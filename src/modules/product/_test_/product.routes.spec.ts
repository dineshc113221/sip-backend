import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import {ProductMock} from "../../../mocks/Product.mock.js";
import ProductModel, { initializeProductModel } from "../product.model.js";
import productRouter from "../product.routes.js";
import CalculationsModel, { initializeCalculationModel } from "../../calculation_api/calculation.model.js";
import FormulaModel, { initializeFormulaModel } from "../../formula/formula.model.js";
import FormulaMock from "../../../mocks/Formula.mock.json";
import ComponentSearchMock from "../../../mocks/ComponentSeach.mock.json";
import initializeProductController from "../product.controller.js";
import RawMaterialsModel, { initializeRawMaterialModel } from "../../raw_material_search/rm_search.model.js";
import RawMaterialMock from "../../../mocks/RawMaterial.mock.json";
import ProductSearchModel, { initializeComponentSearchModel } from "../../component_pc_search/component_search.model.js";
import express from "express";

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

jest.mock('../../../lib/db.connection', () => ({
  connectDatabase: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect: jest.fn()
  })
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
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mocked-message-id',
    }),
  })),
}));
const mockedProductModel = ProductModel as jest.Mock;
const mockedinitializeProductModel = initializeProductModel as jest.Mock;
const mockedCalculationsModel = CalculationsModel as jest.Mock;
const mockedinitializeCalculationModel = initializeCalculationModel as jest.Mock;
const mockedFormulaModel = FormulaModel as jest.Mock;
const mockedinitializeFormulaModel = initializeFormulaModel as jest.Mock;
const mockedRawMaterialsModel = RawMaterialsModel as jest.Mock;
const mockedinitializeRawMaterialModel = initializeRawMaterialModel as jest.Mock;
const mockedProductSearchModel = ProductSearchModel as jest.Mock;
const mockedinitializeComponentSearchModel = initializeComponentSearchModel as jest.Mock;

jest.mock("p-limit", () => {
  return () => <T>(fn: () => Promise<T>): Promise<T> => fn();
});


jest.mock("../product.model");
jest.mock("../../formula/formula.model");
jest.mock("../../raw_material_search/rm_search.model");
jest.mock("../../component_pc_search/component_search.model");

jest.mock("../../admin_version/admin.model.js", () => ({
   __esModule: true,               
  default: jest.fn(() => ({})),  
  initializeadminModel: jest.fn().mockResolvedValue(undefined),
}));
 
jest.mock("../../calculation_api/calculation.model.js", () => ({
   __esModule: true,
  default: jest.fn(() => ({})),
  initializeCalculationModel: jest.fn().mockResolvedValue(undefined),
}));

describe('productRouter', () => {
  const res = mockResponse();
    const req = mockRequest();
    const next = jest.fn();
    res.locals = {
      user: {
        unique_name: "ITEST123",
        name: "ITEST123"
      }
    }
    req.query = {
      skip: 1,
      sortOrder: -1,
      type: "experiment"
    };
    req.params = {
      id: "66f2930877a89aa14b990958",
      assessmentType : "experiment",
      searchString: "test"
    }
    req.body = {
      shortBrandCode: "JJB",
      formula_number: "TAB2299983A-002",
      type: "baseline",
      name: "Poonam",
      role: "Member",
      mail: "PKadam04@kenvue.com",
      assessmentType : "baseline",
      productId: "66f2930877a89aa14b990958",
      ...ProductMock[0].assessments.baseline
    };
    req.header['x-consumer-userId'] = 'ITEST236';
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCalculationsModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
    })
    mockedinitializeCalculationModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
    })
    mockedRawMaterialsModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(RawMaterialMock),
    })
    mockedinitializeRawMaterialModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(RawMaterialMock),
    })
    
    mockedFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(FormulaMock),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "test" }]).mockReturnValue(FormulaMock),
    })
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
  })

  it('Should route to pagination, create, findByIdAndUpdate and findByIdAndDelete for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/add-product') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-product/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/delete/:id') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/myproduct') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/add-assessment') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-assessment/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/delete-assessment/:id') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    req.body = {
      shortBrandCode: "JJB",
      formula_number: "TAB2299983A-002",
      type: "experimental",
      name: "Poonam",
      role: "Member",
      mail: "PKadam04@kenvue.com",
      assessmentType : "baseline",
      productId: "66f2930877a89aa14b990958",
      ...ProductMock[0].assessments.baseline
    };
    const mRouter = {
      get: (path, callback) => {
        if (path === '/myproduct') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/add-assessment') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-assessment/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/delete-assessment/:id') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/productDetails/:id') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/add-member') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-member/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/delete-member/:id') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/productDetails/:id') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/assessment/add-update-packaging') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-member/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/assessment/delete-formulation') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnThis(),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnThis(),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/assessment/details/:assessmentType/:id') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/assessment/add-update-formulation') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-member/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/assessment/delete-formulation') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to all four request for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/search/:searchString') {
          callback(req, res, next);
        }
      },
      post: (path, callback) => {
        if (path === '/assessment/add-update-formulation') {
          callback(req, res, next);
        }
      },
      put: (path, callback) => {
        if (path === '/edit-member/:id') {
          callback(req, res, next);
        }
      },
      delete: (path, callback) => {
        if (path === '/assessment/delete-formulation') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    productRouter();
  });

  it('Should route to processPackaging for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const productController = await initializeProductController();
    await productController.processPackaging(ProductMock[1].assessments.baseline.packaging_level)
  });

  it('Should route to processPackaging for failure message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const productController = await initializeProductController();
    await productController.processPackaging(ProductMock[3].assessments.baseline.packaging_level)
  });

  it('Should route to checkDataValues for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const productController = await initializeProductController();
    await productController.checkDataValues(
      req.body.formulation.productSegment,
      req.body.formulation.productSubSegment,
      req.body.formulation.netContent,
        req.body.formulation.rawMaterials,
        req.body.formulation.useDose,
        req.body.formulation.consumableUse,
        req.body.formulation.productionZone,
        req.body.formulation.salesZone,
        "",
        req.body.formulation.rawMaterialsPercentage
    )
  });

  it('Should route to checkRecycleStatus for success message', async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest.fn().mockResolvedValue([{ "skip": "test" }]).mockReturnValue(ProductMock),
    })
    const productController = await initializeProductController();
    await productController.checkRecycleStatus(
      "66e13e3359d7edf2a177e0fa",
        "66e13e3359d7edf2a177e0fa",
        "primary",
        "Experimental",
    )
  });



  it('Should route to processDataAndCallLambda for success message', async () => {
    mockedProductModel.mockReturnValue({
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(null),
    })
    mockedinitializeProductModel.mockReturnValue({
      sort: jest.fn().mockReturnValue(null),
      findOne: jest.fn().mockReturnThis(),
    })
    const productController = await initializeProductController();
    await productController.generateProductSipId("Caladryl")
  });
});
