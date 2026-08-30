import { Request, Response, NextFunction } from "express";
import { ParsedQs } from "qs";

interface CustomQuery extends ParsedQs {
  sort?: string;
  skip?: string;
  take?: string;
  sortOrder?: string;
}

class Controller {
  protected model;

  constructor(model) {
    this.model = model;
  }

  async pagination(
    req: Request<object, object, object, CustomQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        skip = 0,
        take = 10,
        sort = "createdAt",
        sortOrder = -1,
      } = req.query;
      const query = { isDeleted: false };
      const parameters = {
        skip: Number(skip),
        limit: Number(take),
        sort: {},
      };
      parameters.sort[sort] = sortOrder;
      const docs = await this.model.find(query, null, parameters).exec();
      const count = await this.model.countDocuments(query).exec();
      res.status(200).json({ count, data: docs });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await this.model.findOne({ _id: req.query.id });
      res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await this.model.create(req.body);
      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async find(
    req: Request<object, object, object, CustomQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        skip = 0,
        take = 10,
        sort = "createdAt",
        sortOrder = -1,

      } = req.query;
      const query = { isDeleted: false };
      const parameters = {
        skip: Number(skip),
        limit: Number(take),
        sort: {},
      };
      parameters.sort[sort] = sortOrder;

      parameters.sort[req.query.sort || "createdAt"] = parseInt(
        req.query.sortOrder || "-1"
      );
      const docs = await this.model.find(query, null, parameters);
      res.status(200).json(docs);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await this.model.findById(req.params.id);
      res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async findByIdAndUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(204).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async findByIdAndDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      ).exec();
      res.status(204).json(doc);
    } catch (error) {
      next(error);
    }
  }
}

export default Controller;
