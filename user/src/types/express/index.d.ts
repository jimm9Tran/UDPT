declare namespace Express {
  export interface Request {
    currentUser?: {
      id: string;
      email: string;
    };
  }
}
