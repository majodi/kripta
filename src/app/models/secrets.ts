export interface Secret {
    id?: string;
    uid?: string;
    last_access: string;
    title?: string;
    payload?: Payload;
  }

  export interface EncSecret {
    id?: string;
    uid?: string;
    last_access: string;
    title?: string;
    payload?: string; //encoded >> string <<
  }

  export interface Payload {
    subtitle?: string;
    url?: string;
    username?: string;
    password?: string;
    note?: string;      
  }
