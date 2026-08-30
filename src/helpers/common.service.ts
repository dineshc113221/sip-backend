import { Request, Response, NextFunction } from "express";
import { validate, ValidatorResult, ValidationError } from "jsonschema";
import { Types } from "mongoose";
 
type ValidationType = 'body' | 'query';
 
const validateInputs = (req: Request, res: Response, next: NextFunction, type: ValidationType, schema): void => {
    let data;
 
    if (type === 'body') data = req.body;
    if (type === 'query') data = req.query;
 
    const result: ValidatorResult = validate(data, schema);
 
    if (result.valid) {
        next();
    } else {
        res.status(400).send(result.errors.map((error: ValidationError) => error.message));
    }
};
 
const escapeRegExp = (text: string): string => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
 
const isValidId = (id: string): boolean => {
    try {
        return new Types.ObjectId(id).toString() === id;
    } catch (error) {
        return false;
    }
};
 
const dateDiffInDays = (first: Date, second: Date): number => {
    return Math.round((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
};

export const validateHeaders = async (req: Request) => {
    const system = req.headers['x-consumer-system'];
    const correlationId = req.headers['x-consumer-correlationid'];
    const timestamp = req.headers['x-consumer-timestamp'];
    const contentType = req.headers['content-type'];
    if (!system) {
      throw new Error('bad request - x-consumer-system is required');
    } 
    if (!correlationId) {
      throw new Error('bad request - x-consumer-correlationId is required in headers');
    } 
    if (!timestamp) {
      throw new Error('bad request - x-consumer-timestamp is required in headers');
    } 
  
    if (!contentType) {
      throw new Error('bad request - content-type is required in headers');
    }
  };

const capitalizeFirstLetter = (normalString: string) => normalString
  .charAt(0)
  .toUpperCase() + normalString.slice(1);   

const formatLabel = (text: string) => capitalizeFirstLetter(text);
 
export { validateInputs, isValidId, dateDiffInDays, escapeRegExp, capitalizeFirstLetter, formatLabel };