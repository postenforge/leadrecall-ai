import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { insertLead } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  leads: router({
    submit: publicProcedure
      .input(
        z.object({
          businessName: z.string().min(1, "Business name is required"),
          ownerName: z.string().min(1, "Owner name is required"),
          phone: z.string().min(1, "Phone number is required"),
          email: z.string().email("Valid email is required"),
        })
      )
      .mutation(async ({ input }) => {
        // Insert lead into database
        await insertLead({
          businessName: input.businessName,
          ownerName: input.ownerName,
          phone: input.phone,
          email: input.email,
        });

        // Notify the site owner about the new lead (non-blocking)
        try {
          const notified = await notifyOwner({
            title: `🔥 New Lead: ${input.businessName}`,
            content: `New lead submitted from the landing page:\n\n• Business: ${input.businessName}\n• Owner: ${input.ownerName}\n• Phone: ${input.phone}\n• Email: ${input.email}\n\nReach out within 24 hours to set up their free pilot!`,
          });
          if (!notified) {
            console.warn(`[Leads] Owner notification failed for lead: ${input.businessName}`);
          }
        } catch (err) {
          console.error(`[Leads] Notification error for lead: ${input.businessName}`, err);
        }

        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
