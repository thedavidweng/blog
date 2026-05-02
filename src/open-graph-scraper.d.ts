declare module 'open-graph-scraper' {
  export interface OgsOptions {
    url: string;
    timeout?: number;
    /** Skip fallback that copies e.g. `meta[name=description]` into `ogDescription` (can be wrong on some templates). */
    onlyGetOpenGraphInfo?: boolean;
  }
  export default function ogs(options: OgsOptions): Promise<{
    result: Record<string, unknown>;
    error?: boolean;
  }>;
}
