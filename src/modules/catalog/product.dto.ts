export interface ProductDto {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly price: number;
  readonly oldPrice?: number;
  readonly image: string;
  readonly category:
    "Phones" | "Computers" | "Smart Watches" | "Headphones" | "Accessories";
  readonly brand: string;
  readonly color: string;
  readonly memory?: string;
}
