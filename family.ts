import { Equal, Expect, SubOne, ValuesToKeys } from "./util";
import { Lower } from "ts-toolbelt/out/Number/Lower";
import { Greater } from "ts-toolbelt/out/Number/Greater";

// Relation definitions
type ChildrenToFather = {
  Bob: "George";
  Alice: "George";
  Cindy: "Bob";
  Dave: "Bob";
  Jackie: "Dave"; // Extra
  Eve: "George";
};

type ChildrenToMother = {
  Bob: "Mary";
  Cindy: "Sue";
  Alice: "Jane";
  Jackie: 'Jane'; // Extra
  Pete: "Cindy"; // Extra
  Jean: "Alice"; // Extra
};

type FatherToChildren = ValuesToKeys<ChildrenToFather>;
type MotherToChildren = ValuesToKeys<ChildrenToMother>;

type Gender = "FEMALE" | "MALE";
type NamesToGender = {
  Bob: "MALE";
  George: "MALE";
  Dave: "MALE";
  Mary: "FEMALE";
  Sue: "FEMALE";
  Jane: "FEMALE";
  Alice: "FEMALE";
  Cindy: "FEMALE";
  Eve: "FEMALE";
  Pete: "MALE";
  Jean: "MALE";
  Jackie: "FEMALE";
};

// Known limitation here: Assumes very puristic world where people can mary only once
type Marriages = [["George", "Mary"], ["Alice", "Dave"]];

// Names
type Names =
  | keyof ChildrenToFather
  | keyof ChildrenToMother
  | keyof ValuesToKeys<ChildrenToFather>
  | keyof ValuesToKeys<ChildrenToMother>;

// Gender helpers
type FilterNamesByGender<G extends Gender> = ValuesToKeys<NamesToGender>[G];
type MaleNames = FilterNamesByGender<"MALE">;
type FemaleNames = FilterNamesByGender<"FEMALE">;

type FilterMales<Name extends Names> = Name extends MaleNames ? Name : never;
type FilterFemales<Name extends Names> = Name extends FemaleNames
  ? Name
  : never;

// Now some real fun with family relationships

// Few generic helpers for parents
type ParentInNthLevel<
  Name extends Names,
  ChildrenToParent extends Partial<Record<Names, Names>>,
  ParentNameFilter extends Names,
  Level extends number = 1
> = Level extends 1
  ? Name extends keyof ChildrenToParent
    ? ChildrenToParent[Name] extends ParentNameFilter
      ? ChildrenToParent[Name]
      : never
    : never
  : Level extends Lower<Level, 0>
  ? never
  : ParentInNthLevel<
      Parent<Name>,
      ChildrenToParent,
      ParentNameFilter,
      SubOne<Level>
    >;

type MotherInNthLevel<
  Name extends Names,
  Level extends number = 1
> = ParentInNthLevel<Name, ChildrenToMother, FemaleNames, Level>;

type FatherInNthLevel<
  Name extends Names,
  Level extends number = 1
> = ParentInNthLevel<Name, ChildrenToFather, MaleNames, Level>;

// Few generic helpers for children

type ChildrenOfParent<
  Name extends Names,
  KidGender extends Gender | undefined = undefined
> = Name extends keyof FatherToChildren
  ? Equal<KidGender, "MALE"> extends true
    ? FilterMales<FatherToChildren[Name]>
    : Equal<KidGender, "FEMALE"> extends true
    ? FilterFemales<FatherToChildren[Name]>
    : Equal<KidGender, undefined> extends true
    ? FatherToChildren[Name]
    : never
  : Name extends keyof MotherToChildren
  ? Equal<KidGender, "MALE"> extends true
    ? FilterMales<MotherToChildren[Name]>
    : Equal<KidGender, "FEMALE"> extends true
    ? FilterFemales<MotherToChildren[Name]>
    : Equal<KidGender, undefined> extends true
    ? MotherToChildren[Name]
    : never
  : never;

type ChildrenInNthLevel<
  Name extends Names,
  Level extends number = 1,
  KidGender extends Gender | undefined = undefined
> = Equal<Level, 1> extends true
  ? ChildrenOfParent<Name, KidGender>
  : Lower<Level, 0> extends true
  ? never
  : ChildrenInNthLevel<ChildrenInNthLevel<Name>, SubOne<Level>, KidGender>;

// Finally defining family relationships using generic "level" helpers
type Father<Name extends Names> = FatherInNthLevel<Name>;
type Mother<Name extends Names> = MotherInNthLevel<Name>;
type Parent<Name extends Names> = Father<Name> | Mother<Name>;

type GrandFather<Name extends Names> = FatherInNthLevel<Name, 2>;
type GrandMother<Name extends Names> = MotherInNthLevel<Name, 2>;
type GrandParent<Name extends Names> = GrandFather<Name> | GrandMother<Name>;

type Children<
  Name extends Names,
  KidGender extends Gender | undefined = undefined
> = ChildrenInNthLevel<Name, 1, KidGender>;
type GrandChild<Name extends Names> = ChildrenInNthLevel<Name, 2>;
type GrandGrandChild<Name extends Names> = ChildrenInNthLevel<Name, 3>;

type Brother<Name extends Names> = FilterMales<
  Exclude<Children<Parent<Name>>, Name>
>;
type Sister<Name extends Names> = FilterFemales<
  Exclude<Children<Parent<Name>>, Name>
>;
type Siblings<Name extends Names> = Exclude<Children<Parent<Name>>, Name>;

type Son<Name extends Names> = Children<Name, "MALE">;
type Daughter<Name extends Names> = Children<Name, "FEMALE">;
type GrandSon<Name extends Names> = ChildrenInNthLevel<Name, 2, "MALE">;
type GrandDaughter<Name extends Names> = ChildrenInNthLevel<Name, 2, "FEMALE">;
type GrandGrandSon<Name extends Names> = ChildrenInNthLevel<Name, 3, "MALE">;
type GrandGrandDaughter<Name extends Names> = ChildrenInNthLevel<
  Name,
  3,
  "FEMALE"
>;

type UncleOrAunt<Name extends Names> = Siblings<Parent<Name>>;
type Uncle<Name extends Names> = Brother<Parent<Name>>;
type Aunt<Name extends Names> = Sister<Parent<Name>>;

type Niece<Name extends Names> = Daughter<Siblings<Name>>;
type Nephew<Name extends Names> = Son<Siblings<Name>>;

type Cousin<Name extends Names> = Children<Siblings<Parent<Name>>>;

type Wife<
  Name extends Names,
  MarriageList extends any[] = Marriages
> = MarriageList extends never
  ? never
  : MarriageList extends [infer FirstCouple, ...infer Rest]
  ? Greater<Rest["length"], 1> extends true
    ? Wife<Name, Rest>
    : FirstCouple extends [Name, infer Second]
    ? Second extends Names
      ? NamesToGender[Second] extends "FEMALE"
        ? Second
        : never
      : never
    : FirstCouple extends [infer First, Name]
    ? First extends Names
      ? NamesToGender[First] extends "FEMALE"
        ? First
        : never
      : never
    : Wife<Name, Rest>
  : never;

// Lazy to unify with Wife type O:)
type Husband<
  Name extends Names,
  MarriageList extends any[] = Marriages
> = MarriageList extends never
  ? never
  : MarriageList extends [infer FirstCouple, ...infer Rest]
  ? FirstCouple extends [Name, infer Second]
    ? Second extends Names
      ? NamesToGender[Second] extends "MALE"
        ? Second
        : never
      : never
    : FirstCouple extends [infer First, Name]
    ? First extends Names
      ? NamesToGender[First] extends "MALE"
        ? First
        : never
      : never
    : Husband<Name, Rest>
  : never;

type SisterInLaw<Name extends Names> =
  | Sister<Husband<Name>>
  | Sister<Wife<Name>>;
type BrotherInLaw<Name extends Names> =
  | Brother<Wife<Name>>
  | Brother<Husband<Name>>;

type MotherInLaw<Name extends Names> =
  | Mother<Wife<Name>>
  | Mother<Husband<Name>>;
type FatherInLaw<Name extends Names> =
  | Father<Wife<Name>>
  | Father<Husband<Name>>;

type StepMother<Name extends Names> = Exclude<
  Mother<Siblings<Name>>,
  Mother<Name>
>;

type StepFather<Name extends Names> = Exclude<
    Father<Siblings<Name>>,
    Father<Name>
>;


// Helper validation object
type validation = [
  Expect<Equal<Parent<"Alice">, "George" | "Jane">>,
  Expect<Equal<GrandFather<"Cindy">, "George">>,
  Expect<Equal<GrandMother<"Cindy">, "Mary">>,
  Expect<Equal<Children<"Bob">, "Cindy" | "Dave">>,
  Expect<Equal<Children<"George">, "Alice" | "Bob" | "Eve">>,
  Expect<Equal<Siblings<"Bob">, "Alice" | "Eve">>,
  Expect<Equal<Siblings<"Alice">, "Bob" | "Eve" | 'Jackie'>>,

  Expect<Equal<GrandChild<"George">, "Cindy" | "Dave" | "Jean">>,
  Expect<Equal<GrandChild<"Mary">, "Cindy" | "Dave">>,

  Expect<Equal<GrandGrandChild<"George">, "Pete" | "Jackie">>,

  Expect<Equal<GrandParent<"Cindy">, "George" | "Mary">>,

  Expect<Equal<UncleOrAunt<"Dave">, "Alice" | "Eve">>,
  Expect<Equal<UncleOrAunt<"Cindy">, "Alice" | "Eve">>,

  Expect<Equal<Brother<"Cindy">, "Dave">>,
  Expect<Equal<Brother<"Dave">, never>>,
  Expect<Equal<Sister<"Cindy">, never>>,
  Expect<Equal<Sister<"Dave">, "Cindy">>,

  Expect<Equal<Aunt<"Dave">, "Alice" | "Eve">>,
  Expect<Equal<Uncle<"Dave">, never>>,

  Expect<Equal<FilterMales<"Bob" | "Alice">, "Bob">>,
  Expect<Equal<Children<"George">, "Alice" | "Bob" | "Eve">>,
  Expect<Equal<Son<"George">, "Bob">>,
  Expect<Equal<Daughter<"George">, "Alice" | "Eve">>,

  Expect<Equal<FatherInNthLevel<"Pete", 3>, "George">>,
  Expect<Equal<GrandGrandSon<"George">, "Pete">>,
  Expect<Equal<GrandGrandSon<"Mary">, "Pete">>,
  Expect<Equal<GrandGrandDaughter<"Mary">, "Jackie">>,

  Expect<Equal<GrandSon<"George">, "Dave" | "Jean">>,

  Expect<Equal<GrandDaughter<"Mary">, "Cindy">>,
  Expect<Equal<GrandDaughter<"George">, "Cindy">>,
  Expect<Equal<GrandSon<"George">, "Dave" | "Jean">>,

  Expect<Equal<Niece<"Alice">, "Cindy">>,
  Expect<Equal<Nephew<"Alice">, "Dave">>,
  Expect<Equal<Cousin<"Jean">, "Dave" | "Cindy">>,

  Expect<Equal<Wife<"George">, "Mary">>,
  Expect<Equal<Husband<"George">, never>>,
  Expect<Equal<Wife<"Mary">, never>>,
  Expect<Equal<Husband<"Mary">, "George">>,
  Expect<Equal<Husband<"Alice">, "Dave">>,
  Expect<Equal<SisterInLaw<"Alice">, "Cindy">>,
  Expect<Equal<BrotherInLaw<"Dave">, "Bob">>,
  Expect<Equal<SisterInLaw<"Dave">, "Eve" | 'Jackie'>>,

  Expect<Equal<MotherInLaw<"Dave">, "Jane">>,
  Expect<Equal<MotherInLaw<"Alice">, never>>,
  Expect<Equal<FatherInLaw<"Dave">, "George">>,
  Expect<Equal<FatherInLaw<"Alice">, "Bob">>,

  Expect<Equal<StepMother<"Alice">, "Mary">>,
  Expect<Equal<StepMother<"Bob">, "Jane">>,

  Expect<Equal<StepFather<"Alice">, "Dave">>,
];
