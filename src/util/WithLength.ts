// 長さ指定でタプルを作る
export type WithLength<T, L extends number, V extends T[] = []> = V["length"] extends L
  ? V
  : WithLength<T, L, [T, ...V]>;
