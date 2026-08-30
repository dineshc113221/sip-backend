export interface CustomHeader {
  'x-consumer-correlationId': string;
  'x-consumer-userId': string;
  'x-consumer-timestamp': string;
  'x-consumer-system': string;
  'x-consumer-page-number'?: string;
  'x-consumer-page-size'?: string;
  identifier?: string;
  Authorization?: string;
}

export interface ApiHeaders {
  correlationId: string;
  userId: string;
  timestamp: string;
  system: string;
  pageNumber?: string;
  pageSize?: string;
}

export interface RequestHeaders {
  operation?: string;
  identifier?: string;
  userID: string;
}
