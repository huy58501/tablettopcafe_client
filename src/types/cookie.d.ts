declare module 'cookie' {
  interface CookieParseOptions {
    decode?: (value: string) => string;
  }

  interface CookieSerializeOptions {
    encode?: (value: string) => string;
    maxAge?: number;
    domain?: string;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    priority?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  }

  export function parse(str: string, options?: CookieParseOptions): { [key: string]: string };
  export function serialize(name: string, val: string, options?: CookieSerializeOptions): string;
}
