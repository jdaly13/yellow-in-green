import { prisma } from "~/db.server";
require("dotenv").config();
export async function updateTxInGame(receipt, nativePayoutTx, gameId, address) {
  return prisma.winner.create({
    data: {
      triviaTransaction: receipt?.hash || "",
      nativeTransaction: nativePayoutTx?.hash || "",
      gameId,
      network: process.env.NETWORK,
      id: address,
    },
  });
}

export async function updateWinnerWithNftTransaction(winnerAddress, nftTx) {
  return prisma.winner.update({
    where: {
      id: winnerAddress,
    },
    data: {
      nftTransaction: nftTx,
    },
  });
}
