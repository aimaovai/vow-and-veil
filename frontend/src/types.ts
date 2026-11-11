export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Wedding = {
  id?: string;
  weddingName: string;
  partnerOneName?: string;
  partnerTwoName?: string;
  eventDate?: string;
  venueName?: string;
  city?: string;
  stateProvince?: string;
  budget?: number | string;
  planningStage?: string;
  notes?: string;
};
