import { memo } from 'react';
import { classNames } from '~/utils/classNames';

interface PanelHeaderButtonProps {
  className?: string;
  disabledClassName?: string;
  disabled?: boolean;
  children: string | JSX.Element | Array<JSX.Element | string>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  style?: React.CSSProperties;  // Add style prop to the interface
}

export const PanelHeaderButton = memo(
  ({ className, disabledClassName, disabled = false, children, onClick, style }: PanelHeaderButtonProps) => {
    return (
      <button
        className={classNames(
          'flex items-center shrink-0 gap-1.5 px-1.5 rounded-md py-0.5 text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed',
          {
            [classNames('opacity-30', disabledClassName)]: disabled,
          },
          className,
        )}
        style={style}  // Add style prop to the button
        disabled={disabled}
        onClick={(event) => {
          if (disabled) {
            return;
          }

          onClick?.(event);
        }}
      >
        {children}
      </button>
    );
  },
);