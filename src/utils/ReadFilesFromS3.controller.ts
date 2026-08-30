import { Request, Response } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { config } from "../data/config.js";

const streamToBuffer = async (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export const readFilesFromS3 = async (req: Request, res: Response) => {
  try {
    dotenv.config();

    const s3 = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY,
        secretAccessKey: config.AWS_SECRET_KEY
      }
    });

    const fileName= req.params.fileKey;

    const command = new GetObjectCommand({
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName
     });

    const s3Response = await s3.send(command);
    const buffer = await streamToBuffer(s3Response.Body as any);
    res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load file from S3");
  }
};