import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { createTeam, getTeams } from "@/lib/server/team";
import { getCurrentUser } from "@/lib/server/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "POST":
        return await handlePOST(req, res);
      case "GET":
        return await handleGET(req, res);
      default:
        res.setHeader("Allow", "POST, GET");
        throw new Error(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    return res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
}

// Create a new team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const schema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
  });

  const { name, slug } = schema.parse(req.body);

  const newTeam = await createTeam({
    name,
    slug,
    user: await getCurrentUser(req),
  });

  return res.status(201).json({
    data: newTeam,
  });
};

// Get all teams for the current user
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const currentUser = await getCurrentUser(req);
  const teams = await getTeams(currentUser);

  return res.status(200).json({
    data: teams,
  });
};
