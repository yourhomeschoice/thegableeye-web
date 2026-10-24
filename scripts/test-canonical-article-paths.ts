import assert from "node:assert/strict";
import { canonicalArticlePath } from "../lib/publication/canonical-path.ts";

assert.equal(canonicalArticlePath("Home", "Kitchen", "juicers-compared"), "/home/kitchen/juicers-compared");
assert.equal(canonicalArticlePath("Home", "All About Coffee", "espresso-machine"), "/home/all-about-coffee/espresso-machine");
assert.equal(canonicalArticlePath("Travel", "Travel Essentials", "travel-adapter"), "/travel/travel-essentials/travel-adapter");
assert.throws(() => canonicalArticlePath("Home", "", "article"), /empty/);
console.log("Canonical article path checks passed.");
