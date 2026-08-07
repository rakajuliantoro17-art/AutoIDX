/**
==========================================================
AURA Trade OS
Compression
Version : 0.3.0 Alpha
==========================================================
Compression Contract
==========================================================
*/

export type CompressionAlgorithm =

    | "gzip"

    | "brotli"

    | "deflate"

    | "none";





export interface Compression {

    readonly algorithm:

        CompressionAlgorithm;





    compress(

        data: Uint8Array,

    ): Promise<Uint8Array>;





    decompress(

        data: Uint8Array,

    ): Promise<Uint8Array>;

}

