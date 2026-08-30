import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import FormulaModel, { initializeFormulaModel } from "../formula.model.js";
import FormulaMock from "../../../mocks/Formula.mock.json";
import RawMaterialMock from "../../../mocks/RawMaterial.mock.json";
import formulaRouter from "../formula.routes.js";
import RawMaterialsModel, { initializeRawMaterialModel } from "../../raw_material_search/rm_search.model.js";
import initializeFormulaController from "../formula.controller.js";
import express from "express";

const mockedFormulaModel = FormulaModel as jest.Mock;
const mockedinitializeFormulaModel = initializeFormulaModel as jest.Mock;
const mockedRawMaterialsModel = RawMaterialsModel as jest.Mock;
const mockedinitializeRawMaterialModel = initializeRawMaterialModel as jest.Mock;

jest.mock("../formula.model");
jest.mock("../../raw_material_search/rm_search.model");
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  };
  return { Sequelize: jest.fn(() => mockSequelize) };
});
describe('formulaRouter', () => {


  it('Should route to getFormulaCodes for success message', async () => {

    mockedFormulaModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "FML2057662A-001" }]).mockReturnValue(FormulaMock),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "frml_cd_vers_concat": "FML2057662A-001" }]).mockReturnValue(FormulaMock),
    })
    
    const res = mockResponse();
    const req = mockRequest();
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "FML2057662A"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/formula-codes') {
          callback(req, res);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    formulaRouter();
  });

  it('Should route to getFormulaCodes for failure message', async () => {

    mockedFormulaModel.mockReturnValue({})
    mockedinitializeFormulaModel.mockReturnValue({})
  
    const res = mockResponse();
    const req = mockRequest();
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "FML2056855A"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/formula-codes') {
          callback(req, res);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    formulaRouter();
  });

  it('Should route to getFormulaDetails for success', async () => {

    mockedFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(FormulaMock),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(FormulaMock),
    })
    mockedRawMaterialsModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(RawMaterialMock),
    })
    mockedinitializeRawMaterialModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(RawMaterialMock),
    })
    
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      formulaCode: "FML2057662A"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/formula-details/:formulaCode') {
          callback(req, res);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    formulaRouter();
  });

  it('Should route to getFormulaDetails for failure when data is empty', async () => {

    mockedFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(null),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(null),
    })
    mockedRawMaterialsModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(null),
    })
    mockedinitializeRawMaterialModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(null),
    })
    
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      formulaCode: "TAB2314161A"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/formula-details/:formulaCode') {
          callback(req, res);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    formulaRouter();
  });

  it('Should route to getFormulaDetails for failure', async () => {

    mockedFormulaModel.mockReturnValue({})
    mockedinitializeFormulaModel.mockReturnValue({})
    mockedRawMaterialsModel.mockReturnValue({})
    mockedinitializeRawMaterialModel.mockReturnValue({})
    
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      formulaCode: "TAB2314161A"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/formula-details/:formulaCode') {
          callback(req, res);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    formulaRouter();
  });

  it('Should route to getFormulaRawMaterial for success message', async () => {

    mockedFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(FormulaMock),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue(FormulaMock),
    })
    const formulaController = await initializeFormulaController();
    await formulaController.getFormulaRawMaterial("FML2293983A")
  });

  it('Should route to getFormulaRawMaterial for failure message when data is empty', async () => {

    mockedFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue({}),
    })
    mockedinitializeFormulaModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ "frml_cd_vers_concat": "FML2057662A-001" }).mockReturnValue({}),
    })
    const formulaController = await initializeFormulaController();
    await formulaController.getFormulaRawMaterial("FML2056856B")
  });

});
