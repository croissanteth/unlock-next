export interface User {
  walletAddress: string;
  message?: string;
  signature?: string;
  isLoggedIn: boolean;
}
