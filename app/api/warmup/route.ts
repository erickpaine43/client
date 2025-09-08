import { NextResponse } from "next/server";
import { warmupData } from "@/lib/data/domains.mock";

// GET /api/warmup - Get warmup data for the current user's company
export async function GET() {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const companyId = 1; //session.user.companyId;
    console.log("Company ID:", companyId);

    return NextResponse.json(warmupData);
  } catch (error: unknown) {
    console.error("Warmup Data Error:", String(error));
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "An internal server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
