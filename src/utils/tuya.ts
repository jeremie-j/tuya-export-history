import hmac256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";

import { invoke } from "@tauri-apps/api/tauri";

interface RequestOptions {
  path: string;
  query?: { [key: string]: string };
  body?: { [key: string]: string } | string;
}

interface HttpRequestBuilder {
  method: string;
  url: string;
  query?: { [key: string]: string };
  headers?: { [key: string]: string };
  body?: { [key: string]: string } | string;
  timeout?: Number;
}

interface Token {
  access_token: string;
  expire_time: number;
  refresh_token: string;
}

export class TuyaClient {
  baseUrl = import.meta.env.VITE_TUYABASEURL;
  accessKey = import.meta.env.VITE_ACCESSKEY;
  secretKey = import.meta.env.VITE_SECRETKEY;
  tuyaUserId = import.meta.env.VITE_TUYAUSERID;
  tokenInfo: Token | null = null;

  public calculateSign(
    method: string,
    path: string,
    timestamp: Date | number,
    param: URLSearchParams,
    body?: { [key: string]: string }
  ) {
    let stringToSign = method + "\n";
    stringToSign +=
      sha256(body ? JSON.stringify(body) : "")
        .toString()
        .toLowerCase() + "\n";
    stringToSign += "\n";
    stringToSign += path;

    if (Array.from(param).length > 0) {
      param.sort();
      stringToSign += "?" + param.toString();
    }
    let message = this.accessKey;
    if (this.tokenInfo) {
      message += this.tokenInfo.access_token;
    }
    message += String(timestamp) + stringToSign;

    return hmac256(message, this.secretKey).toString().toUpperCase();
  }

  public async requestSigned(method: string, options: RequestOptions) {
    if (this.tokenInfo != null && !options.path.startsWith("/v1.0/token")) {
      this.refreshAccessTokenIfNeeded();
    }

    const timestamp = Date.now();
    const sign = this.calculateSign(
      method,
      options.path,
      timestamp,
      new URLSearchParams(options.query),
      undefined
    );

    const headers = {
      client_id: this.accessKey,
      access_token: this.tokenInfo?.access_token || "",
      sign: sign,
      sign_method: "HMAC-SHA256",
      t: String(timestamp),
      lang: "en",
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

    if (data.success) {
      return data.result;
    } else {
      throw new Error(data.msg);
    }
  }

  public async connect() {
    const response = await this.get({
      path: "/v1.0/token",
      query: {
        grant_type: "1",
      },
    });
    response.expire_time = Date.now() + response.expire_time * 1000;
    this.tokenInfo = response;
  }

  async refreshAccessTokenIfNeeded() {
    if (this.tokenInfo) {
      if (Date.now() < this.tokenInfo.expire_time) {
        return;
      } else {
        const response = await this.get({
          path: "/v1.0/token/" + this.tokenInfo.refresh_token,
        });
        this.tokenInfo = response;
      }
    }
  }

  async get(options: RequestOptions) {
    const response = await this.requestSigned("GET", options);
    return response;
  }
}
