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


export function clearInterval(handle: TimerHandle) {
    return undefined;
}

export function clearTimeout(handle: TimerHandle) {
    return undefined
}

export function queueMicrotask(
    callback: () => void
) {
    return undefined as void;
}

export function setInterval(
    callback: (args: void) => void,
    delay?: number
) {
    return 0 as TimerHandle;
}

export function setTimeout(
    callback: (args: void) => void,
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
