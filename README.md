# Family Feud: TypeScript Edition

## Challenge description

In this challenge, you’ll dive deep into the world of family relationships, unraveling the complex web of connections
that bind our fictional family together. Your mission is to create TypeScript types that accurately describe various
family relationships based on the provided data. You’ll be given information about parents and their children, and your
goal is to implement types that can represent relationships such as siblings, parents, grandparents, and maybe more. The
more relationships you implement, the better.

See example [image](example.png)

## Solution

- All family relationship types can be found in file [family.ts](./family.ts).
- I used npm package [ts-toolbelt](https://www.npmjs.com/package/ts-toolbelt) to make my life little easier as it
  provides some useful typescript utility types.
- I wanted to have family definitions as close to example one as possible. However, it had some limitations, so I added
  two extra definitions on top of *ChildrenToFather* and *ChildrenToMother*, which are *NamesToGender* and *Marriages*.
  I also added few more records to those original definitions to be able to test some of more complex relations like
  *SisterInLaw* or *StepFather*
- Relations in direction *children* -> *parent* are pretty simple as they require only checking definitions.
- Relations in opposite direction are more tricky, but with a help of *ValuesToKeys* type one is able to reverse the
  direction in very simple way (*FatherToChildren* and *MotherToChildren* types).
- It is also important to know gender of each of our family members. That's what *Gender helpers* section is all about.
- Parent helpers and children helpers are doing the hard work there. They are able to filter parent/children names in
  any level of the family tree (going down for kids or up for parents). Note that we also filter out only male or female
  names
- Well, and next section is all about defining the relationships using those generic ones
- Last section is dedicated to validation types verifying the logic and helping in development