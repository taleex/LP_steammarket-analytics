export interface Transaction {
  id: string | number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}