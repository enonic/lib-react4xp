type Brand<
    Base,
    Branding
> = Base & {
  '__type__': Branding
};

// The returntype for window.setTimeout (in the browser) is number
export type TimerHandle = Brand<number, 'TimerHandle'>

export interface ContextWithTimers {
    clearInterval: (handle: TimerHandle) => void
    clearTimeout: (handle: TimerHandle) => void
    queueMicrotask: (callback: () => void) => void
    setInterval:(
        callback: (args: void) => void,
        delay?: number
    ) => number
    setTimeout: (
        callback: (args: void) => void,
        delay?: number
    ) => number
    [key: string]: unknown
}

//@ts-expect-error TS6133: 'handle' is declared but its value is never read.
export function clearInterval(handle: TimerHandle) {
    return undefined;
}

//@ts-expect-error TS6133: 'handle' is declared but its value is never read.
export function clearTimeout(handle: TimerHandle) {
    return undefined
}

export function queueMicrotask(
	//@ts-expect-error TS6133: 'callback' is declared but its value is never read.
    callback: () => void
) {
    return undefined as void;
}

export function setInterval(
	//@ts-expect-error TS6133: 'callback' is declared but its value is never read.
    callback: (args: void) => void,
	//@ts-expect-error TS6133: 'delay' is declared but its value is never read.
    delay?: number
) {
    return 0 as TimerHandle;
}

export function setTimeout(
	//@ts-expect-error TS6133: 'callback' is declared but its value is never read.
    callback: (args: void) => void,
	//@ts-expect-error TS6133: 'delay' is declared but its value is never read.
    delay?: number
) {
    return 0 as TimerHandle;
}

export function polyfillTimers<
    T extends Partial<ContextWithTimers> = Partial<ContextWithTimers>
>(context: T) {
    if (typeof context.clearInterval === 'undefined') { context.clearInterval = clearInterval; }
    if (typeof context.clearTimeout === 'undefined') { context.clearTimeout = clearTimeout; }
    if (typeof context.queueMicrotask === 'undefined') { context.queueMicrotask = queueMicrotask; }
    if (typeof context.setInterval === 'undefined') { context.setInterval = setInterval; }
    if (typeof context.setTimeout === 'undefined') { context.setTimeout = setTimeout; }
}
