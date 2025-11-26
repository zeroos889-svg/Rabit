import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?:
      | "audio/mpeg"
      | "audio/wav"
      | "application/pdf"
      | "audio/mp4"
      | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

type LlmProvider = "forge" | "deepseek" | "openai";

type LlmConfig = {
  provider: LlmProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  supportsThinking: boolean;
};

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const buildChatCompletionsUrl = (baseUrl: string) => {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (normalized.endsWith("/v1/chat/completions")) return normalized;
  if (normalized.endsWith("/v1")) return `${normalized}/chat/completions`;
  return `${normalized}/v1/chat/completions`;
};

const getAvailableLlmConfigs = (): LlmConfig[] => {
  const providerConfigs: Partial<Record<LlmProvider, LlmConfig>> = {};

  if (ENV.deepseekApiKey) {
    providerConfigs.deepseek = {
      provider: "deepseek",
      apiKey: ENV.deepseekApiKey,
      baseUrl:
        (ENV.deepseekApiUrl && ENV.deepseekApiUrl.trim().length > 0
          ? ENV.deepseekApiUrl
          : "https://api.deepseek.com"),
      model: ENV.deepseekModel || "deepseek-chat",
      supportsThinking: false,
    };
  }

  if (ENV.openaiApiKey) {
    providerConfigs.openai = {
      provider: "openai",
      apiKey: ENV.openaiApiKey,
      baseUrl: "https://api.openai.com",
      model: ENV.openaiModel || "gpt-4o-mini",
      supportsThinking: false,
    };
  }

  if (ENV.forgeApiKey) {
    providerConfigs.forge = {
      provider: "forge",
      apiKey: ENV.forgeApiKey,
      baseUrl:
        (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
          ? ENV.forgeApiUrl
          : "https://forge.manus.im"),
      model: "gemini-2.5-flash",
      supportsThinking: true,
    };
  }

  const defaultOrder: LlmProvider[] = ["deepseek", "openai", "forge"];
  const envOrder = (ENV.llmProviderOrder || "")
    .split(",")
    .map(p => p.trim().toLowerCase())
    .filter(
      (p): p is LlmProvider =>
        p === "deepseek" || p === "openai" || p === "forge"
    );

  const order = envOrder.length > 0 ? envOrder : defaultOrder;
  const configs: LlmConfig[] = [];

  for (const provider of order) {
    const cfg = providerConfigs[provider];
    if (cfg) configs.push(cfg);
  }

  return configs;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const normalizedMessages = messages.map(normalizeMessage);

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );

  const providedMaxTokens = params.maxTokens ?? params.max_tokens;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  const configs = getAvailableLlmConfigs();
  if (configs.length === 0) {
    throw new Error(
      "LLM API key is not configured. Please set DEEPSEEK_API_KEY or another provider key."
    );
  }

  const errors: string[] = [];

  for (const config of configs) {
    const payload: Record<string, unknown> = {
      model: config.model,
      messages: normalizedMessages,
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
    }

    if (normalizedToolChoice) {
      payload.tool_choice = normalizedToolChoice;
    }

    const defaultMaxTokens = config.provider === "forge" ? 32768 : 4096;
    payload.max_tokens =
      typeof providedMaxTokens === "number"
        ? providedMaxTokens
        : defaultMaxTokens;

    if (config.supportsThinking) {
      payload.thinking = {
        budget_tokens: 128,
      };
    }

    if (normalizedResponseFormat) {
      payload.response_format = normalizedResponseFormat;
    }

    try {
      const response = await fetch(buildChatCompletionsUrl(config.baseUrl), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(
          `${config.provider}: ${response.status} ${response.statusText} – ${errorText}`
        );
        continue;
      }

      return (await response.json()) as InvokeResult;
    } catch (error) {
      errors.push(
        `${config.provider}: ${(error as Error)?.message ?? "Unknown error"}`
      );
    }
  }

  throw new Error(
    `All LLM providers failed. Attempts: ${errors.join(" | ")}`
  );
}

// Backwards compatibility for older imports
export const callLLM = invokeLLM;
