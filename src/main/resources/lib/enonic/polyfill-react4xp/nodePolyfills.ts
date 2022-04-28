//──────────────────────────────────────────────────────────────────────────────
// text-encoding
//──────────────────────────────────────────────────────────────────────────────
import {TextEncoder} from 'text-encoding';

(function (context) {
    if (typeof context.TextEncoder === 'undefined') context.TextEncoder = TextEncoder;
})((1, eval)('this'));

