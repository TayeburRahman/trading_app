export type ISubscriptions = {
  planName: 'Platinum' | 'Gold' | 'Diamond' | "Trial";
  fee: number;
  pointRangeStart: number;
  pointRangeEnd: number;
  swapPoint: number;
  positiveCommentPoint: number;
  negativeCommentPoint: number;
  duration: number;
  productPriceLimit: number;
};
