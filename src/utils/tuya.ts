import hmac256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";

import { invoke } from "@tauri-apps/api/tauri";

// export const getAllDevices = async () => {
//   const response = await apiRequestSigned(
//     "/v1.3/iot-03/devices?" +
//       new URLSearchParams({
//         source_type: "tuyaUser",
//         source_id: tuyaUserId,
//       })
//   );
//   return response;
// };

export class TuyaClient {
  baseUrl = import.meta.env.VITE_TUYABASEURL;
  accessKey = import.meta.env.VITE_ACCESSKEY;
  secretKey = import.meta.env.VITE_SECRETKEY;
  tuyaUserId = import.meta.env.VITE_TUYAUSERID;
  accessToken: string = "";

  calculateSign = (
    method: string,
    path: string,
    timestamp: Date | number,
    param?: URLSearchParams,
    body?: { [key: string]: string }
  ) => {
    let stringToSign = method + "\n";
    stringToSign +=
      sha256(body ? JSON.stringify(body) : "")
        .toString()
        .toLowerCase() + "\n";
    stringToSign += "\n";
    stringToSign += path;
    if (param) {
      param.sort();
      stringToSign += "?" + param.toString();
    }
    let message = this.accessKey;
    if (this.accessToken) {
      message += this.accessToken;
    }
    message += String(timestamp) + stringToSign;
    return hmac256(message, this.secretKey).toString().toUpperCase();
  };

  public async requestSigned(options: RequestOptions) {
    const timestamp = Date.now();
    const sign = this.calculateSign(
      options.method,
      options.path,
      timestamp,
      new URLSearchParams(options.query),
      undefined
    );

    const headers = {
      client_id: this.accessKey,
      access_token: this.accessToken,
      sign: sign,
      sign_method: "HMAC-SHA256",
      t: String(timestamp),
      lang: "en",
      "Content-Type": "application/json",
    };

    const requestBuilder: HttpRequestBuilder = {
      method: "GET",
      url: `${this.baseUrl}${options.path}`,
      headers: headers,
      query: options.query,
    };

    let data: any = await invoke("fetch", {
      options: requestBuilder,
    });
    console.log(data);
    return data;
  }

  public async getAccessToken() {
    const response = await this.requestSigned({
      method: "GET",
      path: "/v1.0/token",
      query: {
        grant_type: "1",
      },
    });
    this.accessToken = response.result.access_token;
  }
}

interface RequestOptions {
  method: string;
  path: string;
  query?: { [key: string]: string };
  body?: { [key: string]: string } | string;
}

interface HttpRequestBuilder {
  /// The request method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, CONNECT or TRACE)
  method: string;
  url: string;
  /// The request query params
  query?: { [key: string]: string };
  /// The request headers
  headers?: { [key: string]: string };
  /// The request body
  body?: { [key: string]: string } | string;
  /// Timeout for the whole request
  timeout?: Number;
}
