# Revision 2 agent semantic re-review — same 18 paired PL/EN tuples

Protocol: all visible questions, both hints, each working action and reason, and final localized answers were reviewed. Repeated prose was inspected by shared template; every listed case’s numeric actions were checked individually against exact visible-formula certificates and the SymPy proof. This is not an external-human study or an automatic addition to the historic 75.

36 localized presentations; 230 working steps + 36 final steps = 266 displayed steps. The former unconditional PASS at ace2e815 is withdrawn: five sampled angular tasks were under-defined in BOTH languages (QA003-MV-02), independently confirmed by Work. At review 1 the full sample is 13 PASS / 5 NEEDS_FIXES, not 18 PASS. This record is a new re-review after explicit f=g repair: the SAME 18 tasks now PASS; no coverage counter is increased. Main retains MV-01 and MV-02 until an authorized release.

| Tuple | Independent conclusion / limit | Paths from independent certificate | Both hints / all steps / final PL+EN |
| --- | --- | --- | --- |
| `multivar-path-limit:medium:0` | finite; L=-3; f(point)=— | -3 | PASS (review 2) |
| `multivar-path-limit:medium:1` | does-not-exist; L=—; f(point)=— | -2, -3 | PASS (review 2) |
| `multivar-path-limit:hard:1` | does-not-exist; L=—; f(point)=— | -1, -3/2 | PASS (review 2) |
| `multivar-path-limit:advanced:0` | finite; L=-1; f(point)=— | -1 | PASS (review 2) |
| `multivar-continuity-point:medium:0` | continuous; L=-3; f(point)=-3 | -3 | PASS (review 2) |
| `multivar-continuity-point:medium:1` | removable; L=-2; f(point)=0 | -2 | PASS (review 2) |
| `multivar-continuity-point:medium:2` | nonremovable; L=—; f(point)=-1 | -1, 1/2 | PASS (review 2) |
| `multivar-continuity-point:hard:1` | removable; L=-1; f(point)=0 | -1 | PASS (review 2) |
| `multivar-continuity-point:advanced:2` | nonremovable; L=—; f(point)=-1/3 | -1/3, 1/6 | PASS (review 2) |
| `multivar-polar-homogeneous-limit:hard:0` | finite; L=-5; f(point)=— | -5 | PASS (review 2) |
| `multivar-polar-homogeneous-limit:hard:1` | does-not-exist; L=—; f(point)=— | -4, -15/4 | PASS (review 2) |
| `multivar-polar-homogeneous-limit:advanced:2` | finite; L=-3/2; f(point)=— | -3/2 | PASS (review 2) |
| `multivar-polar-homogeneous-limit:expert:3` | does-not-exist; L=—; f(point)=— | -2/3, -5/6 | PASS (review 2) |
| `multivar-angular-continuity:hard:0` | continuous; L=-3; f(point)=-3 | -3, -3 | PASS (review 2) |
| `multivar-angular-continuity:hard:1` | removable; L=-5; f(point)=-4 | -5, -5 | PASS (review 2) |
| `multivar-angular-continuity:hard:2` | nonremovable; L=—; f(point)=-4 | 1, 2 | PASS (review 2) |
| `multivar-angular-continuity:advanced:1` | removable; L=-5/2; f(point)=-2 | -5/2, -5/2 | PASS (review 2) |
| `multivar-angular-continuity:expert:5` | nonremovable; L=—; f(point)=-1 | -5/3, -1 | PASS (review 2) |

## Reasoning decisions

- Review 2 checks that every continuity question explicitly defines f=g off the translated target and assigns f at that same target. These facts are never inferred from solutions or the requested answer. Both TS and SymPy reject the actual old questions and relation-deletion mutations.
- The other three families were checked: multivar-continuity-point already defines f=g; the two limit families directly ask about the only displayed function g and need no separate extension f.
- Translation keeps the punctured approach set and does not use the assigned central value to infer a limit. Denominator sums of even powers vanish only at the origin.
- Bounded branches use a uniform square/squeeze bound. Absolute values handle negative factors; the polar bound is independent of angle.
- Nonexistence branches retain nonzero path parameters before cancellation. Different line/parabola or axis/diagonal limits suffice; matching axes alone would not establish existence.
- Equal angular coefficients produce an identically constant quotient on the entire punctured domain. This exact identity, explicitly shown before point comparison, justifies continuity/removability.
- A single point redefinition removes only a mismatch with an existing limit; it cannot repair a nonexistent limit. Expert angular v5 correctly remains nonremovable even though its assigned value agrees with one axis limit.
- The original Polish last angular step exposes English enums. The candidate uses the existing full localized classification sentence; final answer keys and all numeric calculations are unchanged.
- Bare coefficient notation b+a and difficulty calibration warrant separate clarity/usability validation. No contradictory numeric result or missing all-path proof was found in reviewed solutions.

## Reproducible presentation fingerprints

- `multivar-path-limit:medium:0` pl: `69007013e8008aabcb3984d59f977f36d7a9e7c99e3b379d6277541fc6425982`
- `multivar-path-limit:medium:0` en: `418cf71982801f29e79a3e13ff247bac3538f7ea38f048e748ae5fecc7f180e5`
- `multivar-path-limit:medium:1` pl: `43c09d36bac7ae1834d8fba427d397cd589362db30ac710d21ca58ca3d2d460c`
- `multivar-path-limit:medium:1` en: `6088613b6289cc39d0b52b28d453652d7c97396211860171df3b080f28347deb`
- `multivar-path-limit:hard:1` pl: `6b946e5125202c6fb83883c7184556224e1acd649ed61370830ebb5c94a7ca54`
- `multivar-path-limit:hard:1` en: `ef1297ed56e9523803f1b4d271558351bd4581c1562481fe56acb3d171da07b6`
- `multivar-path-limit:advanced:0` pl: `4dfda24111a88ce718b5929d7d067a7f0a2102b7853364d44508a91df00a2756`
- `multivar-path-limit:advanced:0` en: `989c930317ce53959d9c0f1fc6cd185ad86a937b751ad356b430f2501e04c5b9`
- `multivar-continuity-point:medium:0` pl: `415de7303b668a21c8c394e545ec457cbc035ae2914ceb5e7894f913bc691aed`
- `multivar-continuity-point:medium:0` en: `b41b76726339b9d58b03a8e165e8c9d77140ee7cb3051a95a18cefdb70e7e07e`
- `multivar-continuity-point:medium:1` pl: `52d7962a0f3d2156123aa5b72271e39295da82ed1df47f6a8279b366a7f38c95`
- `multivar-continuity-point:medium:1` en: `170b8d5f7eb8e341debe0b051da681d06df10fd46b270587993b77ed9ab5543e`
- `multivar-continuity-point:medium:2` pl: `27ce73b9854489846684eed09d5ea5539563bf25617c493b4eb74bc830a75633`
- `multivar-continuity-point:medium:2` en: `00520ad36482093243b3b5455800b8a1ecabb921d7c322f8efa67ade0bec0f32`
- `multivar-continuity-point:hard:1` pl: `aaadcb81790b90afb84f107c7ecf04afa1067a587e69bfce6c5e409dac8ec2b0`
- `multivar-continuity-point:hard:1` en: `d615cd8b9e3961ffce1e501005b7ceabe9f38388cb04a54c4d79b51889a261e9`
- `multivar-continuity-point:advanced:2` pl: `8d0da84b878c7d9df5051fbf8508f7eb05386792d3e5a2f5c0c2c027b662825b`
- `multivar-continuity-point:advanced:2` en: `0ae2ad9d4079c62f0f04cfefffad223791e41981d37072cf9a02197569a4fedb`
- `multivar-polar-homogeneous-limit:hard:0` pl: `ff9a105563c8944bcad15d9b8184625759c9dea220a3b59e51f5619e13f454ab`
- `multivar-polar-homogeneous-limit:hard:0` en: `930802d6eed041fcecfde635261c7bb4f8efa769290c8a7d23cfcac6a1d956be`
- `multivar-polar-homogeneous-limit:hard:1` pl: `65dea972752de11cbee12936fb53bb8a027b8dce5afeaaa3d79d9cc5d2ad4fa6`
- `multivar-polar-homogeneous-limit:hard:1` en: `495409a6b6974e57620149a68c5c3b3360b55be2d5989308b9f65fad0a86950e`
- `multivar-polar-homogeneous-limit:advanced:2` pl: `eecd44e23cd11c34d2baf4e1c213797dc02f74db4d28d8d4653b38d5070a8ad4`
- `multivar-polar-homogeneous-limit:advanced:2` en: `90e903c387bdd41489db6ed46df5fae8fa426a79c8fdfec942a74969098c7077`
- `multivar-polar-homogeneous-limit:expert:3` pl: `4ef3d40dad8d6d866744baa14149b34316f2502e17048a4e1183bffe464e95a1`
- `multivar-polar-homogeneous-limit:expert:3` en: `0c12a449f264d6ce44e19e5deae30b569d6a2fdb3a5a7da63c949e46c6971550`
- `multivar-angular-continuity:hard:0` pl: `041092252f46731458e496336106d9602fd3efe1c339c09fa7b03a24856ebd64`
- `multivar-angular-continuity:hard:0` en: `cb510d276e0185dee6dc58d75367a74e96e0b6abc2c64367b373213e213ebf22`
- `multivar-angular-continuity:hard:1` pl: `6bb32caef12057896d861b8213defea816f31ccef2b81e348ce7753cd9a5c461`
- `multivar-angular-continuity:hard:1` en: `992dccfa4bafdf6839f110eb554e1fd4467b96e24ddb7bd38cec5379920f63a9`
- `multivar-angular-continuity:hard:2` pl: `388b9eb00710064aa37d5bffdc68c39c9b670929fcb7575973b3df0209567c9f`
- `multivar-angular-continuity:hard:2` en: `7cb81b4adecb08f83bc8dd5e4d6d0fd5ddd3b2f176bf15e7d1468f5cd1894983`
- `multivar-angular-continuity:advanced:1` pl: `6f3f27660a4605b15e80b2893784b06bef639e2a49b9476c63bd4dcb23a4fd4e`
- `multivar-angular-continuity:advanced:1` en: `1bd165089c1a34897431e44f93047ee808621427b2577777df42e334924f98ce`
- `multivar-angular-continuity:expert:5` pl: `52dad575188d19126a381f1fe95a03737cea13f0ce18a7e842e7e404f8d6fcd6`
- `multivar-angular-continuity:expert:5` en: `602e8d60d5136da5b0153ae81e2eedbda18716205e8cf685ee261ec6af4b629b`
