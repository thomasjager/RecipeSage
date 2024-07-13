import { trpcSetup, tearDown } from "../../testutils";
import { prisma } from "@recipesage/prisma";
import { User } from "@prisma/client";
import type { CreateTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../../index";

describe("updateMealPlan", () => {
  let user: User;
  let trpc: CreateTRPCProxyClient<AppRouter>;

  beforeAll(async () => {
    ({ user, trpc } = await trpcSetup());
  });

  afterAll(() => {
    return tearDown(user.id);
  });
  describe("success", () => {
    it("updates a meal plan", async () => {
      const { user: user2 } = await trpcSetup();
      const collaboratorUsers = [user2];
      const createdMealPlan = await prisma.mealPlan.create({
        data: {
          title: "Protein",
          userId: user.id,
          collaboratorUsers: {
            createMany: {
              data: collaboratorUsers.map((collaboratorUser) => ({
                userId: collaboratorUser.id,
              })),
            },
          },
        },
      });
      const response = await trpc.mealPlans.updateMealPlan.mutate({
        title: "not protein",
        id: createdMealPlan.id,
        collaboratorUserIds: [user2.id],
      });
      const updatedMealPlan = await prisma.mealPlan.findUnique({
        where: {
          id: response.id,
        },
      });
      expect(updatedMealPlan?.title).toEqual("not protein");

      await tearDown(user2.id);
    });
  });
  describe("error", () => {
    it("throws when meal plan not found", async () => {
      return expect(async () => {
        await trpc.mealPlans.updateMealPlan.mutate({
          id: "00000000-0c70-4718-aacc-05add19096b5",
          title: "Protein",
          collaboratorUserIds: [user.id],
        });
      }).rejects.toThrow(
        "Meal plan with that id does not exist or you do not have access",
      );
    });
    it("must throw on meal plan not owned", async () => {
      const { user: user2 } = await trpcSetup();
      const collaboratorUsers = [user2];
      await prisma.mealPlan.create({
        data: {
          title: "Protein",
          userId: user.id,
          collaboratorUsers: {
            createMany: {
              data: collaboratorUsers.map((collaboratorUser) => ({
                userId: collaboratorUser.id,
              })),
            },
          },
        },
      });
      return expect(async () => {
        await trpc.mealPlans.updateMealPlan.mutate({
          id: user2.id,
          title: "Protein",
          collaboratorUserIds: [user2.id],
        });
      }).rejects.toThrow(
        "Meal plan with that id does not exist or you do not have access",
      );
    });
  });
});
