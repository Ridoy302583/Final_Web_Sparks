// @ts-nocheck
import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { MODEL_LIST, DEFAULT_MODEL, DEFAULT_PROVIDER } from '~/utils/constants';

// Interfaces
interface ImageMatch {
  found: boolean;
  base64Data?: string;
  mimeType?: string;
}

interface ContentItem {
  type: 'text' | 'image';
  text?: string;
  image?: URL;
}

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
  model?: string;
  images?: ImageMatch[];
}

interface ProcessedMessage {
  content: string;
  model: string;
  images: ImageMatch[];
}

export type Messages = Message[];
export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

// Content parsing function
function parseContent(content: string): { text: string; images: ImageMatch[] } {
  try {
    // Check if content is in the new array format
    const contentStr = content.trim();
    if (contentStr.startsWith('[') && contentStr.endsWith(']')) {
      try {
        // Parse the content array
        const items: ContentItem[] = JSON.parse(contentStr);
        const textParts: string[] = [];
        const images: ImageMatch[] = [];

        items.forEach(item => {
          if (item.type === 'text' && item.text) {
            textParts.push(item.text);
          } else if (item.type === 'image' && item.image) {
            try {
              const imageUrl = new URL(item.image);
              // Convert URL to base64 format expected by the system
              // This is a placeholder - you'll need to implement actual image fetching
              images.push({
                found: true,
                base64Data: imageUrl,
                mimeType: 'image/jpeg' // You'll need to detect actual mime type
              });
            } catch (e) {
              console.warn('Invalid image URL:', item.image);
            }
          }
        });

        return {
          text: textParts.join('\n'),
          images: images.length > 0 ? images : [{ found: false }]
        };
      } catch (e) {
        console.error('Error parsing content array:', e);
      }
    }
    
    // Fallback to existing image extraction if not in new format
    return {
      text: content,
      images: extractImageData(content)
    };
  } catch (error) {
    console.error('Error in parseContent:', error);
    return {
      text: content,
      images: [{ found: false }]
    };
  }
}

// Image processing functions
function extractImageData(content: string): ImageMatch[] {
  const images: ImageMatch[] = [];
  const imageRegex = /\[Image: (data:image\/[^;]+;base64,[^\]]+)\]/g;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const fullImageData = match[1];
    const [mimeType, base64Data] = fullImageData.split(',');
    
    images.push({
      found: true,
      base64Data,
      mimeType: mimeType.replace('data:', '')
    });
  }

  return images.length > 0 ? images : [{ found: false }];
}

function removeImageData(content: string): string {
  return content.replace(/\[Image: (data:image\/[^;]+;base64,[^\]]+)\]/g, '[Image]');
}

// Model extraction function
function extractModelFromMessage(message: Message): { model: string; content: string } {
  const modelRegex = /^\[Model: (.*?)\]\n\n/;
  const match = message.content.match(modelRegex);

  if (match) {
    const model = match[1];
    const content = message.content.replace(modelRegex, '');
    return { model, content };
  }

  return { model: DEFAULT_MODEL, content: message.content };
}

// Complete message processing function
function processMessage(message: Message): ProcessedMessage {
  // First extract model information
  const { model, content: modelContent } = extractModelFromMessage(message);
  
  // Parse content for both text and images
  const { text, images } = parseContent(modelContent);
  
  // Clean content by removing image data if in old format
  const cleanedContent = removeImageData(text);
  
  return {
    content: cleanedContent,
    model,
    images
  };
}

// Async function to fetch and convert image to base64
async function fetchImageAsBase64(url: string): Promise<ImageMatch> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return {
      found: true,
      base64Data,
      mimeType
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    return { found: false };
  }
}

// Main streaming function
export async function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  let currentModel = DEFAULT_MODEL;
  
  const processedMessages = await Promise.all(messages.map(async (message) => {
    if (message.role === 'user') {
      const processed = processMessage(message);
      
      if (processed.model && MODEL_LIST.find((m) => m.name === processed.model)) {
        currentModel = processed.model;
      }
      
      // Handle any URL-based images that need fetching
      if (processed.images.some(img => !img.base64Data && img.found)) {
        const updatedImages = await Promise.all(
          processed.images.map(async (img) => {
            if (img.found && !img.base64Data) {
              // Assume the URL is stored in the mimeType field temporarily
              return await fetchImageAsBase64(img.mimeType);
            }
            return img;
          })
        );
        
        return {
          ...message,
          content: processed.content,
          images: updatedImages.filter(img => img.found)
        };
      }
      
      return {
        ...message,
        content: processed.content,
        images: processed.images.filter(img => img.found)
      };
    }
    return message;
  }));

  const provider = MODEL_LIST.find((model) => model.name === currentModel)?.provider || DEFAULT_PROVIDER;

  return _streamText({
    model: getModel(provider, currentModel, env),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(processedMessages),
    ...options,
  });
}
