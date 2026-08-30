import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { config } from "../../data/config.js";
import { readFilesFromS3 } from "../ReadFilesFromS3.controller.js";

jest.mock("@aws-sdk/client-s3");

describe("readFilesFromS3", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      params: {
        fileKey: "test-file.pdf",
      },
    };

    res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should read file from S3 and send buffer response", async () => {
    const mockStream = new Readable();
    mockStream.push(Buffer.from("mock file content"));
    mockStream.push(null);

    (S3Client.prototype.send as jest.Mock).mockResolvedValue({
      Body: mockStream,
      ContentType: "application/pdf",
    });

    await readFilesFromS3(req, res);

    expect(S3Client).toHaveBeenCalledWith({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY,
        secretAccessKey: config.AWS_SECRET_KEY,
      },
    });

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: "test-file.pdf",
    });

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf"
    );

    expect(res.send).toHaveBeenCalledWith(
      Buffer.from("mock file content")
    );
  });

  it("should fallback to application/octet-stream if ContentType is missing", async () => {
    const mockStream = new Readable();
    mockStream.push(Buffer.from("no content type"));
    mockStream.push(null);

    (S3Client.prototype.send as jest.Mock).mockResolvedValue({
      Body: mockStream,
    });

    await readFilesFromS3(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/octet-stream"
    );
  });

  it("should return 500 if S3 throws error", async () => {
    (S3Client.prototype.send as jest.Mock).mockRejectedValue(
      new Error("S3 error")
    );

    await readFilesFromS3(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Failed to load file from S3"
    );
  });
});
