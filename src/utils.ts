import { apiProviders } from "./constants";
import { ServerMessageKey, StreamResponse } from "./types";

export function safeParseJson<T>(data: string): T | undefined {
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return undefined;
  }
}

export function createMessage<T>(key: ServerMessageKey, data?: T): string {
  return JSON.stringify({ key, data });
}

export function isStreamWithDataPrefix(stringBuffer: string) {
  return stringBuffer.startsWith('data:')
}

export function safeParseStreamResponse(
  stringBuffer: string
): StreamResponse | undefined {
  try {
    if (isStreamWithDataPrefix(stringBuffer)) {
      return JSON.parse(stringBuffer.split('data:')[1])
    }
    return JSON.parse(stringBuffer)
  } catch (e) {
    return undefined
  }
}

export const getChatDataFromProvider = (
  provider: string,
  data: StreamResponse | undefined
) => {
  switch (provider) {
    case apiProviders.Ollama:
    case apiProviders.OpenWebUI:
      return data?.choices[0].delta?.content
        ? data?.choices[0].delta.content
        : ''
    case apiProviders.LlamaCpp:
      return data?.content
    case apiProviders.LiteLLM:
    default:
      if (data?.choices[0].delta.content === 'undefined') return ''
      return data?.choices[0].delta?.content
        ? data?.choices[0].delta.content
        : ''
  }
}