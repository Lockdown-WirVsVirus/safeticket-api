import * as mongoose from 'mongoose';

export const COUNTER_MODEL_NAME = 'CounterSequence';
export const MIN_COUNTER_VALUE = 10_000;

interface DbUniqueCounter {
    seq: number;
}

export interface CounterModel extends DbUniqueCounter, mongoose.Document {}

export const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: MIN_COUNTER_VALUE },
});
