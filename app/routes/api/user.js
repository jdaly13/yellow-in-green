import { prisma } from "~/db.server";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const address = urlToSearch.searchParams.get("address");
  const game = urlToSearch.searchParams.get("game");
  return prisma.user.upsert({
    where: {
      address: address,
    },
    update: {
      gameId: game,
    },
    create: {
      address: address,
      gameId: game,
    },
    include: {
      submissions: {
        where: {
          gameId: game,
        },
      },
      invalidSubmissions: {
        where: {
          gameId: game,
        },
      },
    },
  });
}
