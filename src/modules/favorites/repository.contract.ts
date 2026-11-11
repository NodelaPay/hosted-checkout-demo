export interface FavoritesRepository {
  list(guestId: string): Promise<readonly string[]>;
  add(guestId: string, productId: string): Promise<void>;
  remove(guestId: string, productId: string): Promise<void>;
}
