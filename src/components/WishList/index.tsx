import React from 'react';
import { Gift, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { useWishlist } from '@/lib/services/wishlist/hooks';
import { WishItemActions, WishItemError } from './components';

export default function WishList() {
  const { user } = useAuth();
  const { isLoading, wishList, errors, processingItems, handleMarkAsBought, handleRevertBought } = useWishlist();

  const getBoughtText = (reservation: any) => {
    if (!reservation) return '';
    if (!user || !reservation.user_id) return 'Gekocht';
    return user.id === reservation.user_id ? 'Door jou gekocht' : 'Door iemand gekocht';
  };

  return (
    <div className="p-4 sm:p-6 bg-white/80 rounded-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
        <Gift className={user ? "animate-bounce" : ""} />
        {user ? "Mijn Verlanglijstje" : "Azra's Verlanglijstje"}
      </h2>

      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.join('. ')}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Cadeaus laden...
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {wishList.map((item) => {
            const isBought = item.status === 'bought';
            const isProcessing = processingItems.has(item.id);
            const canMarkAsBought = !isBought && !isProcessing;
            const canRevert = user && isBought && item.user_id === user.id;

            return (
              <Card key={item.id} className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-1 pt-2 px-3">
                  <div className="flex items-start gap-2">
                    {isBought ? (
                      <Star className="w-5 h-5 mt-1 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    ) : (
                      <Star className="w-5 h-5 mt-1 text-yellow-400 flex-shrink-0" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        {item.item}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-1 px-3">
                  {isBought && (
                    <Badge variant="success" className="mt-1 text-xs sm:text-sm">
                      {getBoughtText(item)}
                    </Badge>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center py-2 px-3">
                  <WishItemActions
                    link={item.link}
                    isBought={isBought}
                    isProcessing={isProcessing}
                    canMarkAsBought={canMarkAsBought}
                    canRevert={canRevert}
                    onMarkAsBought={() => handleMarkAsBought(item.id)}
                    onRevertBought={() => user && handleRevertBought(item.id, user.id)}
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}