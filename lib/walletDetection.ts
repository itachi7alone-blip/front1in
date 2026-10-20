export function hasCompatibleWallet(): boolean {
  if (typeof window === 'undefined') return false;
  const providers = (window as any).eip6963Providers ?? [];
  return Array.isArray(providers) && providers.length > 0;
}
