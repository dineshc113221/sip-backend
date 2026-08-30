import { mockRequest, mockResponse } from "../../utils/MockInterceptor.js";
import {ProductMock} from "../../mocks/Product.mock.js";
import Controller from "../controller.js";

jest.mock('../../lib/db.connection', () => ({
    connections: jest.fn().mockResolvedValue({
      connection: { readyState: 1 },
      disconnect:jest.fn()
    })
}));
describe('productRouter', () => {
    let controller: Controller;
    const res = mockResponse();
    const req = mockRequest();
    const next = jest.fn();
    res.locals = {
        user: {
            unique_name: "ITEST123",
            id: "ITEST123",
            name: "ITEST123"
        }
    }
    req.query = {
        skip: 1,
        sortOrder: -1,
        type: "experiment",
        _id: "66f2f95206a36e538ff6710d",
        rawMaterialID: "TAB2314161A",
        objectKey: "TAB2314161A",
        tradeName: "Neutral Ethanol - For Self Care Use Only",
        isDeleted: true
    };
    req.params = {
        id: "66f2930877a89aa14b990958",
        assessmentType: "experiment",
        searchString: "test"
    }
    req.body = [{
        shortBrandCode: "JJB",
        formula_number: "TAB2299983A-002",
        type: "baseline",
        name: "Poonam",
        role: "Member",
        mail: "PKadam04@kenvue.com",
        assessmentType: "baseline",
        productId: "66f2930877a89aa14b990958",
        ...ProductMock[0].assessments.baseline
    }];
    req.header['x-consumer-userId'] = 'ITEST236';

    it('Should route to pagination, findOne, create,createMultiple for success message', async () => {
        const mockCollection = {
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnValue(ProductMock),
            limit: jest.fn().mockReturnValue(ProductMock),
            skip: jest.fn().mockReturnValue(ProductMock),
            exec: jest.fn().mockReturnValue(ProductMock),
            toArray: jest.fn(),
            findOne: jest.fn().mockReturnValue(ProductMock),
            create: jest.fn().mockReturnValue(ProductMock),
            insertMany: jest.fn().mockReturnValue(ProductMock),
            countDocuments: jest.fn().mockReturnThis(),
        };
        controller = new Controller(mockCollection);
        controller.pagination(req, res, next);
        controller.findOne(req, res, next);
        controller.create(req, res, next);
        controller.createMultiple(req, res);
    });

    it('Should route to find, findById, findByIdAndUpdate, findByIdAndDelete for success message', async () => {
        const mockCollection = {
            find: jest.fn().mockReturnValue(ProductMock),
            findById: jest.fn().mockReturnValue(ProductMock),
            findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
            findByIdAndDelete: jest.fn().mockReturnValue(ProductMock),
            
        };
        controller = new Controller(mockCollection);
        controller.find(req, res, next);
        controller.findById(req, res, next);
        controller.findByIdAndUpdate(req, res, next);
        controller.findByIdAndDelete(req, res, next);
        
    });

    it('Should route to pagination, findOne, create, find, findById, findByIdAndUpdate, findByIdAndDelete for failure message', async () => {
        const mockCollection = {};
        controller = new Controller(mockCollection);
        controller.pagination(req, res, next)
        expect(next).toHaveBeenCalled()

        controller.findOne(req, res, next);
        expect(next).toHaveBeenCalled()

        controller.create(req, res, next);
        expect(next).toHaveBeenCalled()

        // expect(controller.createMultiple(req, res)).toThrow()

        controller.find(req, res, next);
        expect(next).toHaveBeenCalled()

        controller.findById(req, res, next);
        expect(next).toHaveBeenCalled()

        controller.findByIdAndUpdate(req, res, next);
        expect(next).toHaveBeenCalled()

        controller.findByIdAndDelete(req, res, next);
        expect(next).toHaveBeenCalled()
    });


});
