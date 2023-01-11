import {TextEncoder} from 'text-encoding';


type Brand<
    Base,
    Branding
> = Base & {
  '__type__': Branding
};

// The returntype for window.setTimeout (in the browser) is number
type TimerHandle = Brand<number,'TimerHandle'>


(function (context) {
    //──────────────────────────────────────────────────────────────────────────
    // When doing SSR it makes no sense to do anything asyncronously.
    // Therefore these should just be dummies:
    // * clearInterval
    // * clearTimeout
    // * queueMicrotask
    // * setInterval
    // * setTimeout
    //──────────────────────────────────────────────────────────────────────────
    if (typeof context.clearInterval === 'undefined') {
        context.clearInterval = (handle: TimerHandle) => undefined
    }
    if (typeof context.clearTimeout === 'undefined') {
        context.clearTimeout = (handle: TimerHandle) => undefined
    }
    if (typeof context.queueMicrotask === 'undefined') {
        context.queueMicrotask = (
            callback: () => void
        ) => {
            return undefined as void;
        };
    }
    if (typeof context.setInterval === 'undefined') {
        context.setInterval = (
            callback: (args: void) => void,
            delay?: number
        ) => {
            return 0 as TimerHandle;
        };
    }
    if (typeof context.setTimeout === 'undefined') {
        context.setTimeout = (
            callback: (args: void) => void,
            delay?: number
        ) => {
            return 0 as TimerHandle;
        };
    }
    //──────────────────────────────────────────────────────────────────────────
    // text-encoding
    //──────────────────────────────────────────────────────────────────────────
    if (typeof context.TextEncoder === 'undefined') {
        context.TextEncoder = TextEncoder;
    }
})((1, eval)('this'));
