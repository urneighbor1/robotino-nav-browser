import { z } from "zod";

interface Command {
  endPoint: string;
  Validator: z.ZodType<unknown, z.ZodTypeDef, unknown>;
  isAsync: boolean;
}

export interface CommandGet<T> extends Command {
  Validator: z.ZodType<T, z.ZodTypeDef, Response>;
}

export interface CommandPost<T> extends Command {
  Validator: z.ZodType<string, z.ZodTypeDef, T>;
}
