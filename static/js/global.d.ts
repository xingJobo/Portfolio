/** Alpine.js — loaded from CDN in templates/index.html */
interface AlpineGlobal {
  data<T extends object>(name: string, factory: () => T): void;
}

declare const Alpine: AlpineGlobal;
