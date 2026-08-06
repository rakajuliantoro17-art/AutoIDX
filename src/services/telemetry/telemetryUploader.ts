/**
==========================================================
AURA Trade OS
Telemetry Uploader
Version : 0.3.0 Alpha
==========================================================
Telemetry Transport Contract
==========================================================
*/

export interface TelemetryUploadRequest {

    readonly payload: Uint8Array;

    readonly contentType: string;

}





export interface TelemetryUploadResponse {

    readonly success: boolean;

    readonly status: number;

    readonly message?: string;

}





export interface TelemetryUploader {

    /*
    ======================================================
    Upload
    ======================================================
    */

    upload(

        request: TelemetryUploadRequest,

    ): Promise<TelemetryUploadResponse>;

}


