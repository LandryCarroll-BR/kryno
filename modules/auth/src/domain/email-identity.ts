export const normalizeEmailIdentity = (email: string) =>
  email.trim().toLocaleLowerCase("en-US")
