import React from 'react';
import { Check, Undo2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WishItemActionsProps = {
  link: string;
  isBought: boolean;
  isProcessing: boolean;
  canMarkAsBought: boolean;
  canRevert: boolean;
  onMarkAsBought: () => void;
  onRevertBought: () => void;
};

export default function WishItemActions({
  link,
  isBought,
  isProcessing,
  canMarkAsBought,
  canRevert,
  onMarkAsBought,
  onRevertBought
}: WishItemActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {canMarkAsBought && (
        <Button
          variant="default"
          onClick={onMarkAsBought}
          className="gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Getting gift...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              I got this gift! 🎁
            </>
          )}
        </Button>
      )}
      
      {canRevert && (
        <Button
          variant="destructive"
          onClick={onRevertBought}
          className="gap-2"
        >
          <Undo2 className="w-4 h-4 inline-block mr-1" />
          Oops, undo! 🔄
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        asChild
      >
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}