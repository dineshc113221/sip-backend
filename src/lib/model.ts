import { Model as MongooseModel, Document, model } from 'mongoose';
 
 
class Model<T extends Document> {
    private model: MongooseModel<T>;
 
    constructor(name: string, schema) {
        this.model = model<T>(name, schema);
        this.model.on('index', (error) => {
            if (error) console.error(error);
        });
    }
 
    insertMany(docs: T[]): Promise<T[]> {
        return this.model.insertMany(docs);
    }
 
    count(query: object): Promise<number> {
        return this.model.countDocuments(query).exec();
    }
 
    create(doc: T, session?): Promise<T> {
        const newDoc = new this.model(doc);
        if (session) {
            newDoc.$session(session);
        }
        return newDoc.save();
    }
 
    findOne(query: object): Promise<T | null> {
        return this.model.findOne(query).exec();
    }
 
    findOneAndUpdate(query: object, update: object, options: object = {}): Promise<T | null> {
        return this.model.findOneAndUpdate(query, update, options).exec();
    }
 
    find(query: object): Promise<T[]> {
        return this.model.find(query).exec();
    }
 
    findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }
 
    findByIdAndUpdate(id: string, update: object, options: object = {}): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, options).exec();
    }
 
    findByIdAndDelete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }
 
    aggregate(pipeline) {
        return this.model.aggregate(pipeline).exec();
    }
}
 
export default Model;