export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

const METAMASK_RDNS = new Set([
  'io.metamask',
  'io.metamask.flask',
  'io.metamask.mobile',
  'com.metamask',
  'io.metamask.dev',
  'io.metamask.mmi',
]);

const KNOWN_NON_METAMASK = new Set([
  'io.rabby',
  'com.trustwallet.app',
  'com.coinbase.wallet',
  'com.okex.wallet',
  'me.rainbow',
  'com.binance.wallet',
  'app.phantom',
  'io.zerion.wallet',
  'com.bitkeep.wallet',
  'io.onekey.wallet',
  'com.brave.wallet',
  'com.frame.wallet',
  'xyz.ambire.wallet',
  'com.ledger',
  'org.safe',
  'pro.tokenpocket',
  'com.bitpie.wallet',
  'io.imtoken',
  'com.alphawallet',
  'com.mathwallet',
  'com.coin98.wallet',
  'io.zapper',
  'com.argent.wallet',
]);

function isMetaMask(detail: EIP6963ProviderDetail): boolean {
  const rdns = String(detail.info?.rdns || '').toLowerCase();
  if (METAMASK_RDNS.has(rdns)) return true;
  if (KNOWN_NON_METAMASK.has(rdns)) return false;

  const name = String(detail.info?.name || '').trim().toLowerCase();
  if (name === 'metamask' || name === 'meta mask' || name === 'metamask flask') return true;

  const p = detail.provider;
  if (
    p?.isMetaMask === true &&
    !p?.isRabby &&
    !p?.isTrust &&
    !p?.isCoinbaseWallet &&
    !p?.isOkxWallet &&
    !p?.isRainbow &&
    !p?.isBraveWallet
  ) {
    return true;
  }
  return false;
}

export function discoverEIP6963Providers(timeout = 700): Promise<EIP6963ProviderDetail[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const providers: EIP6963ProviderDetail[] = [];
    const seenRdns = new Set<string>();

    const handler = (event: any) => {
      const detail = event?.detail;
      if (!detail?.info || !detail?.provider) return;
      const rdns = String(detail.info.rdns || '').toLowerCase();
      if (!rdns) return;
      if (isMetaMask(detail)) return;
      if (seenRdns.has(rdns)) return;
      seenRdns.add(rdns);
      providers.push(detail);
    };

    window.addEventListener('eip6963:announceProvider', handler);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handler);
      resolve(providers);
    }, timeout);
  });
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  if (win.ethereum?.isMetaMask && !win.ethereum?.isRabby && !win.ethereum?.isTrust) return true;
  if (win.web3?.currentProvider?.isMetaMask) return true;
  if (Array.isArray(win.ethereum?.providers)) {
    return win.ethereum.providers.some(
      (p: any) => p?.isMetaMask && !p?.isRabby && !p?.isTrust
    );
  }
  return false;
}

export function isMetaMaskProvider(provider: any): boolean {
  if (!provider) return false;
  const name = String(provider?.name || '').toLowerCase();
  if (name === 'metamask' || name === 'meta mask') return true;
  return (
    provider?.isMetaMask === true &&
    !provider?.isRabby &&
    !provider?.isTrust &&
    !provider?.isCoinbaseWallet &&
    !provider?.isOkxWallet
  );
}
