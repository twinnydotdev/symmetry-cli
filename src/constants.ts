export const NORMALIZE_REGEX = /\s*\r?\n|\r/g;

export const PROVIDER_HELLO_TIMEOUT = 30000

export const serverMessageKeys = {
  challenge: "challenge",
  conectionSize: "conectionSize",
  heartbeat: "heartbeat",
  inference: "inference",
  inferenceEnded: "inferenceEnded",
  join: "join",
  joinAck: "joinAck",
  leave: "leave",
  newConversation: "newConversation",
  ping: "ping",
  pong: "pong",
  providerDetails: "providerDetails",
  reportCompletion: "reportCompletion",
  requestProvider: "requestProvider",
  sessionValid: "sessionValid",
  verifySession: "verifySession",
} as const;

export const apiProviders = {
  LiteLLM: 'litellm',
  LlamaCpp: 'llamacpp',
  LMStudio: 'lmstudio',
  Ollama: 'ollama',
  Oobabooga: 'oobabooga',
  OpenWebUI: 'openwebui',
} as const