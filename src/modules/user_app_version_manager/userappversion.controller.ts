/* eslint-disable @typescript-eslint/no-unused-expressions */
import { NextFunction, Request, Response } from "express";
import Controller from "../../lib/controller.js";
import userAppVersionModel, { initializeUserAppVersionModel } from "./userappversion.model.js";

class userAppVersionController extends Controller {
  constructor(model) {
    super(model);
  }
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        mail: req.params.id,
      };
      const pipelines = [{ $match: query }];
      const doc = await this.model.aggregate(pipelines).exec();
      res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async findByIdAndUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const query = {
            mail: req.params.id,
        };
        const updatePipeline = [{
            $set: {
                mail: req.params.id,
                ...req.body
            }
        }];
        const options = {
            new: true,
            upsert:  true,
            setDefaultOnInsert: true
        }

        const updateDoc = await this.model.findOneAndUpdate(query, updatePipeline, options).exec();
        res.status(204).json(updateDoc)
      } catch (error) {
        next(error)
      }
  }
  
}

export const initializeUserAppVersionController = async () => {
  await initializeUserAppVersionModel();
  const userAppVersionModels = userAppVersionModel();
  return new userAppVersionController(userAppVersionModels);
};

export default initializeUserAppVersionController;
