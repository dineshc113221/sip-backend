import * as crypto from "crypto-js";
import { URL } from "url";
import { config } from "../data/config.js";

// Generate the Signature Version 4
export const createSignedRequest = (
  url: string,
  payload: object,
  service: string,
  functionName: string | undefined,
  methodType:string,
  region:string
) => {
  const accessKeyId = config.AWS_ACCESS_KEY;
  const secretAccessKey = config.AWS_SECRET_KEY;

  const method = methodType;
  const host = new URL(url).host;
  const endpoint = url;

  // Get current date and time in the required format
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const canonicalUri = `/2024-08-26/functions/${functionName}/invocations`;
  const canonicalQuerystring = "";
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-date";
  const payloadHash = crypto
    .SHA256(JSON.stringify(payload))
    .toString(crypto.enc.Hex);

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .SHA256(canonicalRequest)
    .toString(crypto.enc.Hex)}`;

  const signingKey = getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = crypto
    .HmacSHA256(stringToSign, signingKey)
    .toString(crypto.enc.Hex);

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    endpoint,
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      Authorization: authorizationHeader,
    },
    body: JSON.stringify(payload),
  };
};

// Get the signing key
const getSignatureKey = (
  key: string,
  dateStamp: string,
  region: string,
  serviceName: string
) => {
  const kDate = crypto.HmacSHA256(dateStamp, "AWS4" + key);
  const kRegion = crypto.HmacSHA256(region, kDate);
  const kService = crypto.HmacSHA256(serviceName, kRegion);
  const kSigning = crypto.HmacSHA256("aws4_request", kService);
  return kSigning;
};
