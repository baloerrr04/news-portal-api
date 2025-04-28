import { z } from "zod";

export const LoginAndRegisterDTO = z.object({
  username: z.string(),
  password: z.string(),
});

