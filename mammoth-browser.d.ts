declare module 'mammoth/mammoth.browser' {
  interface ExtractRawTextInput {
    arrayBuffer: ArrayBuffer;
  }

  interface ConvertToHtmlInput {
    arrayBuffer: ArrayBuffer;
  }

  interface ConvertToHtmlOptions {
    includeDefaultStyleMap?: boolean;
    ignoreEmptyParagraphs?: boolean;
  }

  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  interface ConvertToHtmlResult {
    value: string;
    messages: unknown[];
  }

  const mammoth: {
    extractRawText(input: ExtractRawTextInput): Promise<ExtractRawTextResult>;
    convertToHtml(input: ConvertToHtmlInput, options?: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
  };

  export default mammoth;
}
