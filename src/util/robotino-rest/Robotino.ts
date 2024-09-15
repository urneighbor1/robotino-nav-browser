import { z } from "zod";

import { fetchWithTimeout } from "../fetch";
import type { CommandGet, CommandPost } from "./Command";

export class Robotino {
  #baseUrl: string = "";
  #sid: string = "";
  #paused = { state: false, timeout: -1 };
  #waitTimeMiliSeconds: number;

  constructor(baseUrl: string, sid: string, waitTimeMiliSeconds: number = 60) {
    this.baseUrl = baseUrl;
    this.sid = sid;
    this.#waitTimeMiliSeconds = z
      .number()
      .refine(value => 10 <= value && value <= 10000)
      .parse(waitTimeMiliSeconds);
  }

  set baseUrl(value: string) {
    if (this.#paused.timeout !== -1) clearTimeout(this.#paused.timeout);
    this.#paused = { state: false, timeout: -1 };

    this.#baseUrl = z
      .string()
      .url()
      .parse(value.replace(/^(\w+:\/\/)?/, "http://"));
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  set sid(value: string) {
    this.#sid = z.string().min(1).parse(value);
  }
  get sid() {
    return this.#sid;
  }

  readonly #PAUSE_DURATION = 5000; // 5秒間ポーズを有効とする

  async get<T>(command: CommandGet<T>): Promise<T> {
    if (this.#paused.state) {
      throw new Error("フェッチが一時停止中です。");
    }

    try {
      const response = await fetchWithTimeout(
        `${this.#baseUrl}/${command.endPoint}?sid=${this.#sid}`,
        this.#waitTimeMiliSeconds,
        {
          method: "GET",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = command.isAsync
        ? await command.Validator.parseAsync(response)
        : command.Validator.parse(response);

      return data;
    } catch (error) {
      this.#paused = {
        state: true,
        timeout: setTimeout(() => {
          this.#paused = { state: false, timeout: -1 };
        }, this.#PAUSE_DURATION),
      };
      throw error;
    }
  }

  async post<T>(command: CommandPost<T>, parameter: T): Promise<void> {
    const data = command.Validator.parse(parameter);

    if (this.#paused.state) {
      return;
    }

    await fetchWithTimeout(
      `${this.#baseUrl}/${command.endPoint}?sid=${this.#sid}`,
      this.#waitTimeMiliSeconds,
      {
        method: "POST",
        cache: "no-cache",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return;
  }
}
