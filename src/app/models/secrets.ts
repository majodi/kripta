export interface Secret {
    id: string;
    uid?: string;
    title?: string;
    payload?: Payload;
    // subtitle?: string;
    // url?: string;
    // username?: string;
    // password?: string;
    // note?: string;
  }

  export interface EncSecret {
    // id: string;
    uid?: string;
    title?: string;
    payload?: string; //encoded
  }

  export interface Payload {
    subtitle?: string;
    url?: string;
    username?: string;
    password?: string;
    note?: string;      
  }
