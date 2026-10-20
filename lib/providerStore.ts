const RDNS_KEY = 'pc_v4_provider_rdns';

let cachedProvider: any = null;
let cachedRdns: string | null = null;

export function setSelectedProvider(provider: any, rdns: string) {
  cachedProvider = provider;
  cachedRdns = rdns;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RDNS_KEY, rdns);
  }
}

export function getActiveProvider(): any {
  return cachedProvider;
}

export function getProviderRdns(): string | null {
  if (cachedRdns) return cachedRdns;
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(RDNS_KEY);
}
