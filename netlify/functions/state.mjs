// Shared storage so everyone in the flat sees the same machine status.
import { getStore } from "@netlify/blobs";

export const config = { path: "/api/state" };

export default async (req) => {
  const store = getStore({ name: "laundry", consistency: "strong" });
  const state = (await store.get("state", { type: "json" })) || { washer: null, dryer: null };

  if (req.method === "POST") {
    const { machine, data } = await req.json();
    if (!["washer", "dryer"].includes(machine)) return new Response("Bad machine", { status: 400 });
    state[machine] = data
      ? {
          name: String(data.name || "Someone").slice(0, 30),
          cycle: String(data.cycle || "").slice(0, 40),
          start: Number(data.start),
          end: Number(data.end),
        }
      : null;
    await store.setJSON("state", state);
  }
  return Response.json(state);
};
