import type {Cache} from '../../../..';


//@ts-ignore
import {newCache}  from '/lib/cache';


export const templateDescriptorCache = newCache({
    size: 100,
    expire: 600 // 10 minutes before needing a new fetch-and-check from ES (getDescriptorFromTemplate)
}) as Cache;
