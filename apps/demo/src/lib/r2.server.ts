import "server-only";

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getR2Endpoint(): string {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  if (endpoint) {
    return trimTrailingSlash(endpoint);
  }

  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

function getR2BucketName(): string {
  return getRequiredEnv("R2_BUCKET");
}

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (r2Client) {
    return r2Client;
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint: getR2Endpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return r2Client;
}

function isMissingObjectError(error: unknown): boolean {
  if (error instanceof S3ServiceException) {
    return (
      error.name === "NotFound" ||
      error.name === "NoSuchKey" ||
      error.$metadata.httpStatusCode === 404
    );
  }

  return false;
}

export async function headR2Object(key: string): Promise<boolean> {
  try {
    await getR2Client().send(
      new HeadObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      }),
    );

    return true;
  } catch (error) {
    if (isMissingObjectError(error)) {
      return false;
    }

    throw error;
  }
}

export async function getR2Object(
  key: string,
): Promise<ArrayBuffer | null> {
  try {
    const response = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      }),
    );

    if (!response.Body) {
      return null;
    }

    return await response.Body.transformToByteArray().then((bytes) => {
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
    });
  } catch (error) {
    if (isMissingObjectError(error)) {
      return null;
    }

    throw error;
  }
}

type PutR2ObjectParams = {
  key: string;
  body: ArrayBuffer;
  contentType: string;
  cacheControl: string;
};

export async function putR2Object({
  key,
  body,
  contentType,
  cacheControl,
}: PutR2ObjectParams): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: Buffer.from(body),
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
}
