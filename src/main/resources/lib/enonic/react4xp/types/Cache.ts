export interface Cache {
	get<A>(key: string, fetcher: () => A): A;
	clear(): void;
	getSize(): number;
	remove(key: string): void;
	removePattern(keyRegex: string): void;
}
