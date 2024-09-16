import { z } from "zod";

import { WithLength } from "../WithLength";
import type { CommandGet, CommandPost } from "./Command";

const ResponseSchema = z.custom<Response>(async response => response instanceof Response && response.ok);
const NumberArrayWithLengthSchema = <L extends number>(length: L) =>
  z.array(z.number()).length(length) as unknown as z.ZodType<WithLength<number, L>>;
// CommandGet

export const Test: CommandGet<boolean> = {
  endPoint: "",
  Validator: ResponseSchema.transform(response => response.ok),
  isAsync: false,
};

export const GetCam0: CommandGet<Blob> = {
  endPoint: "cam0",
  Validator: ResponseSchema.transform(async response => await response.blob()),
  isAsync: true,
};

export const GetBumper: CommandGet<boolean> = {
  endPoint: "data/bumper",
  Validator: ResponseSchema.transform(async response => await response.json())
    .pipe(z.object({ value: z.boolean() }))
    .transform(result => result.value),
  isAsync: true,
};

export const GetOdometry: CommandGet<WithLength<number, 7>> = {
  endPoint: "data/odometry",
  Validator: ResponseSchema.transform(async response => await response.json()).pipe(
    NumberArrayWithLengthSchema(7)
  ),
  isAsync: true,
};

// CommandPost

export const SetVelocity: CommandPost<WithLength<number, 3>> = {
  endPoint: "data/omnidrive",
  Validator: NumberArrayWithLengthSchema(3).transform(value => JSON.stringify(value)),
  isAsync: false,
};
