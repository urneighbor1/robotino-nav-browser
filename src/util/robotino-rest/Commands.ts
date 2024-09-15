import { z } from "zod";

import { WithLength } from "../WithLength";
import type { CommandGet, CommandPost } from "./Command";

const ResponseSchema = z.custom<Response>(async response => response instanceof Response && response.ok);
const NumberArraySchema = z.array(z.number());

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

export const GetOdometry = {
  endPoint: "data/odometry",
  Validator: ResponseSchema.transform(async response => await response.json()).pipe(
    NumberArraySchema.length(7)
  ),
  isAsync: true,
} as unknown as CommandGet<WithLength<number, 7>>;

// CommandPost

export const SetVelocity: CommandPost<number[]> = {
  endPoint: "data/omnidrive",
  Validator: NumberArraySchema.length(3).transform(value => JSON.stringify(value)),
  isAsync: false,
};
