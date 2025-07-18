export async function POST(req) {
  try {
    const { homeTeam, awayTeam, markets } = await req.json();

    console.log("Received teams:", homeTeam, awayTeam, markets);

    return new Response(
      JSON.stringify({
        success: true,
        received: { homeTeam, awayTeam, markets },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to parse request body:", error);
    return new Response(JSON.stringify({ error: "Failed to parse request" }), {
      status: 400,
    });
  }
}
