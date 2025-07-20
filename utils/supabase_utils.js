import { supabase } from "@/utils/supabaseServerClient";
// Make sure supabase is exported from a shared module

export async function findTeamIdByName(name) {
  const { data, error } = await supabase
    .from("team")
    .select("espn_id")
    .ilike("name", `%${name}%`)
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error(`Team not found: ${name}`);
  return data[0].espn_id;
}
