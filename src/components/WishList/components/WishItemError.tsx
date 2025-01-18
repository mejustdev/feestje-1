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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {canMarkAsBought && (
        <Button
          variant="default"
          onClick={onMarkAsBought}
          className="gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
          className="gap-2 w-full sm:w-auto"
        >
          <Undo2 className="w-4 h-4" />
          Oops, undo! 🔄
        </Button>
      )}
      
      <Button
        variant="ghost"
        asChild
        className="gap-2 px-3 w-full sm:w-auto justify-center text-pink-500 hover:text-pink-600 hover:bg-pink-50"
      >
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">View Gift</span>
        </a>
      </Button>
    </div>
  );
}