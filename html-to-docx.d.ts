declare module 'html-to-docx' {
  interface HtmlToDocxOptions {
    orientation?: 'portrait' | 'landscape';
    pageSize?: {
      width?: number;
      height?: number;
    };
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
      header?: number;
      footer?: number;
      gutter?: number;
    };
    title?: string;
    subject?: string;
    creator?: string;
    keywords?: string[];
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
    createdAt?: Date;
    modifiedAt?: Date;
    font?: string;
    fontSize?: string | number;
    complexScriptFontSize?: string | number;
    lang?: string;
  }

  export default function htmlToDocx(
    htmlString: string,
    headerHTMLString?: string | null,
    documentOptions?: HtmlToDocxOptions,
    footerHTMLString?: string | null,
  ): Promise<Blob | Buffer | ArrayBuffer>;
}
