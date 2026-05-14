export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type FormState = ActionResult | undefined;
