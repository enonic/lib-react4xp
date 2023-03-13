import type {React4xp} from '../../React4xp';


export function setIsPage(this: React4xp, isPage: boolean) {
	this.isPage = isPage ? 1 : 0;
	return this;
}
