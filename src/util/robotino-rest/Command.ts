import { z } from "zod";

interface Command {
  readonly endPoint: string;
  readonly Validator: z.ZodType<unknown, z.ZodTypeDef, unknown>;
  readonly isAsync: boolean;
}

export interface CommandGet<T> extends Command {
  readonly Validator: z.ZodType<T, z.ZodTypeDef, Response>;
}

export interface CommandPost<T> extends Command {
  readonly Validator: z.ZodType<string, z.ZodTypeDef, T>;
}
