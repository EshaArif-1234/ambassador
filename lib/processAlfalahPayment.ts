import {

  type AlfaIpnResult,

  alfaCheckStatusWithRetry,

  alfaFetchIpnFromUrl,

  extractOrderRefFromIpnUrl,

  isAlfaConfigured,

  isAlfalahReturnFailed,

  isAlfalahReturnFallbackAllowed,

  isAlfalahReturnSuccess,

} from '@/lib/alfaPayment';

import {

  markOrderFailedFromAlfa,

  markOrderPaidFromAlfa,

} from '@/lib/paymentOrderService';



export type AlfalahProcessResult = {

  status: 'paid' | 'failed' | 'pending';

  orderRef: string;

};



async function applyIpnToOrder(

  orderRef: string,

  ipn: AlfaIpnResult,

): Promise<AlfalahProcessResult> {

  if (ipn.isPaid) {

    await markOrderPaidFromAlfa(orderRef, ipn.raw);

    return { status: 'paid', orderRef };

  }



  if (ipn.isFailed) {

    const reason =

      typeof ipn.raw.ResponseMessage === 'string'

        ? ipn.raw.ResponseMessage

        : typeof ipn.raw.Description === 'string'

          ? ipn.raw.Description

          : ipn.status === 'SessionEnded'

            ? 'Payment session ended without completion.'

            : 'Payment was declined by Alfalah.';

    await markOrderFailedFromAlfa(orderRef, reason);

    return { status: 'failed', orderRef };

  }



  return { status: 'pending', orderRef };

}



function returnParamsToRaw(orderRef: string, params: URLSearchParams): Record<string, unknown> {

  const raw: Record<string, unknown> = {

    TransactionReferenceNumber: orderRef,

    O: orderRef,

  };

  params.forEach((value, key) => {

    raw[key] = value;

  });

  return raw;

}



/** Verify Alfalah IPN and update order status (idempotent). */

export async function processAlfalahOrder(orderRef: string): Promise<AlfalahProcessResult> {

  if (!isAlfaConfigured()) {

    return { status: 'pending', orderRef };

  }



  const ipn = await alfaCheckStatusWithRetry(orderRef);

  return applyIpnToOrder(orderRef, ipn);

}



/**
 * Process Alfalah return URL — IPN first.
 * RC=00 from the customer redirect is accepted only in non-production (localhost testing).
 */

export async function processAlfalahReturn(

  orderRef: string,

  returnParams?: URLSearchParams,

): Promise<AlfalahProcessResult> {

  if (!isAlfaConfigured()) {

    return { status: 'pending', orderRef };

  }



  const ipn = await alfaCheckStatusWithRetry(orderRef);

  const fromIpn = await applyIpnToOrder(orderRef, ipn);

  if (fromIpn.status !== 'pending') {

    return fromIpn;

  }



  if (!returnParams) {

    return fromIpn;

  }



  if (isAlfalahReturnSuccess(returnParams)) {
    if (!isAlfalahReturnFallbackAllowed()) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('[processAlfalahReturn] ignored RC=00 without IPN confirmation', { orderRef });
      }
      return fromIpn;
    }

    await markOrderPaidFromAlfa(orderRef, returnParamsToRaw(orderRef, returnParams), {
      strictAmountCheck: false,
    });

    return { status: 'paid', orderRef };
  }

  if (isAlfalahReturnFailed(returnParams)) {
    if (!isAlfalahReturnFallbackAllowed()) {
      return fromIpn;
    }

    const rc = returnParams.get('RC') ?? returnParams.get('ResponseCode') ?? 'unknown';

    await markOrderFailedFromAlfa(orderRef, `Alfalah payment declined (code ${rc}).`);

    return { status: 'failed', orderRef };
  }



  if (process.env.NODE_ENV !== 'production') {

    console.info('[processAlfalahReturn] still pending', {

      orderRef,

      ipnStatus: ipn.status,

      ipnRaw: ipn.raw,

      returnParams: Object.fromEntries(returnParams.entries()),

    });

  }



  return fromIpn;

}



/** Process Alfalah listener callback that includes a direct IPN URL. */

export async function processAlfalahFromIpnUrl(ipnUrl: string): Promise<AlfalahProcessResult> {

  const orderRef = extractOrderRefFromIpnUrl(ipnUrl) ?? '';



  if (!isAlfaConfigured()) {

    return { status: 'pending', orderRef };

  }



  const ipn = await alfaFetchIpnFromUrl(ipnUrl);

  const resolvedRef = orderRef || ipn.transactionRef || '';

  if (!resolvedRef) {

    return { status: 'pending', orderRef: '' };

  }



  return applyIpnToOrder(resolvedRef, ipn);

}


