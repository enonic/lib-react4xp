import type {React4xp} from '../../React4xp';


export function setHasRegions(this: React4xp, hasRegions :boolean) {
	this.hasRegions = hasRegions ? 1 : 0;
	return this;
}
