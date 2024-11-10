import { modificationsRegex } from '~/utils/diff';
import { MODEL_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  // Extract image if present
  const imageRegex = /\[Image:\s*(data:image\/[^[\]]+)\]/;
  const imageMatch = content.match(imageRegex);
  
  // Clean the content
  const cleanedContent = content
    .replace(modificationsRegex, '')
    .replace(MODEL_REGEX, '')
    .replace(imageRegex, '') // Remove image data from text
    .trim();

  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{cleanedContent}</Markdown>
      {imageMatch && imageMatch[1] && (
        <div className="mt-4 overflow-hidden rounded-lg w-1/2"> {/* Added w-1/2 for half width */}
          <img 
            src={imageMatch[1]} 
            alt="User provided content" 
            className="w-full h-auto object-contain" /* Changed to w-full to fit container */
          />
        </div>
      )}
    </div>
  );
}