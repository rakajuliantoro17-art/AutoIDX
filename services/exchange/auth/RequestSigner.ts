/**
==========================================================
AURA Trade OS
Request Signer (HMAC-SHA512)
Version : 0.1.0 Alpha

Signer generik untuk private API exchange yang memakai skema
HMAC-SHA512 atas query string / request body (mis. Indodax
Trade API: https://github.com/btcid/indodax-official-api-docs).

Tidak exchange-specific — IndodaxPrivateClient (atau adapter
exchange lain di masa depan) yang menentukan bagaimana
`totalParams` disusun (nonce vs timestamp+recvWindow, dsb).
==========================================================
*/
import { createHmac } from "crypto";

export interface SignedRequest {
  /**
   * String parameter (query string atau
   * request body) yang sudah ditandatangani.
   */
  totalParams: string;
  /**
   * Hasil HMAC-SHA512, hex-encoded.
   */
  signature: string;
}

export class RequestSigner {
  /**
   * Bangun `totalParams` dari object parameter,
   * urutan key mengikuti urutan insersi object
   * (bukan di-sort) — sesuai contoh resmi Indodax
   * yang memakai `http_build_query` / URLSearchParams
   * apa adanya, tanpa reordering.
   */
  static buildTotalParams(
    params: Record<string, string | number | boolean>
  ): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      search.append(key, String(value));
    }

    return search.toString();
  }

  /**
   * Hitung signature HMAC-SHA512 dari `totalParams`
   * memakai secretKey sebagai HMAC key.
   *
   * Signature tidak case-sensitive di sisi Indodax,
   * tapi tetap dikembalikan lowercase hex (default
   * Node crypto) untuk konsistensi.
   */
  static sign(secretKey: string, totalParams: string): string {
    if (!secretKey) {
      throw new Error(
        "RequestSigner.sign: secretKey kosong — tidak boleh menandatangani request tanpa secret key."
      );
    }

    return createHmac("sha512", secretKey)
      .update(totalParams)
      .digest("hex");
  }

  /**
   * Convenience: bangun totalParams dari object params,
   * lalu langsung tandatangani. Mengembalikan keduanya
   * karena request POST butuh body (totalParams) DAN
   * header Sign (signature) sekaligus.
   */
  static signParams(
    secretKey: string,
    params: Record<string, string | number | boolean>
  ): SignedRequest {
    const totalParams = RequestSigner.buildTotalParams(params);
    const signature = RequestSigner.sign(secretKey, totalParams);

    return { totalParams, signature };
  }
}

export default RequestSigner;
