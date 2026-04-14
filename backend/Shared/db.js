
import mongoose from "mongoose";
import { User, Complaint } from "./models.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/DEMO";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    // console.log("Connected to MongoDB (GMS)");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Process will exit and hopefully restart in a production env, 
    // but for local dev we might want to wait and retry.
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  connectDB();
});

// Retry Wrapper for DB operations
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`DB operation failed, retrying (${i + 1}/${retries})...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// Compatibility layer for existing Lambda functions using DynamoDB commands
export const ddb = {
  send: async (command) => {
    return withRetry(async () => {
      const input = command?.input || {};
      const tableName = input.TableName;

      const isUserTable = tableName?.toLowerCase().includes("user") || tableName === process.env.USER_TABLE;
      const Model = isUserTable ? User : Complaint;

      const commandName = command?.constructor?.name;

      if (commandName === "PutCommand") {
        const item = input.Item;
        let query = {};
        if (item.email) query = { email: item.email };
        else if (item.complaintId) query = { complaintId: item.complaintId };
        else if (item.userId) query = { userId: item.userId };

        await Model.findOneAndUpdate(query, item, { upsert: true, new: true, runValidators: true });
        return { $metadata: { httpStatusCode: 200 } };
      }

      if (commandName === "GetCommand") {
        const doc = await Model.findOne(input.Key);
        return { Item: doc ? doc.toObject() : null };
      }

      if (commandName === "ScanCommand") {
        const limit = input.Limit ? parseInt(input.Limit) : 0;
        const skip = input.ExclusiveStartKey ? parseInt(input.ExclusiveStartKey) : 0;

        let query = Model.find({ isDeleted: { $ne: true } });
        if (skip) query = query.skip(skip);
        if (limit) query = query.limit(limit);

        const docs = await query.exec();
        return {
          Items: docs.map(d => d.toObject()),
          LastEvaluatedKey: limit && docs.length === limit ? (skip + limit).toString() : null
        };
      }

      if (commandName === "UpdateCommand") {
        const doc = await Model.findOneAndUpdate(input.Key, { $set: input.AttributeUpdates || {} }, { new: true });
        return { Attributes: doc ? doc.toObject() : null };
      }

      throw new Error(`Unsupported command in Mongo bridge: ${commandName}`);
    });
  }
};

export const localTables = {};
