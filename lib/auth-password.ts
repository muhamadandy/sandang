import { hash, compare } from "bcrypt-ts-edge";

export const passwordConfig = {
  hash: (password: string) => hash(password, 10),
  verify: ({ hash: hashed, password }: { hash: string; password: string }) =>
    compare(password, hashed),
};
