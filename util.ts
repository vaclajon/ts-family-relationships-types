import { Sub } from "ts-toolbelt/out/Number/Sub";

// https://github.com/type-challenges/type-challenges/blob/main/utils/index.d.ts
export type Expect<T extends true> = T;
// https://github.com/type-challenges/type-challenges/blob/main/utils/index.d.ts
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

export type SubOne<T extends number> = Sub<T, 1>;

export type ValuesToKeys<Object extends Record<string, string>> = {
  [K in keyof Object as Object[K]]: K;
};
