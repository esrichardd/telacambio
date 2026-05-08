import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";
import type {
  Group,
  GroupMember,
  GroupWithMembers,
  Album,
  Collection,
  Profile,
} from "@/types/app";
import { computeSummary } from "@/lib/utils/collection";

type Client = SupabaseClient<Database>;

type CreateGroupInput = {
  album_id: string;
  name: string;
  description?: string;
  owner_id: string;
};

// Tipos locales para los resultados de los joins anidados
type StickerEntry = { sticker_id: string; quantity: number };

type MemberCollection = Collection & {
  profile: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url" | "trading_status"
  >;
  stickers: StickerEntry[];
};

type RawMember = GroupMember & { collection: MemberCollection };

type GroupWithAlbum = Group & { album: Album };

/** Busca un grupo por su invite_code. Retorna null si no existe o está inactivo. */
export async function getGroupByInviteCode(
  client: Client,
  inviteCode: string,
): Promise<Group | null> {
  const { data, error } = await client
    .from("groups")
    .select("*")
    .eq("invite_code", inviteCode)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/** Crea un nuevo grupo */
export async function createGroup(
  client: Client,
  input: CreateGroupInput,
): Promise<Group> {
  const payload: TablesInsert<"groups"> = input;

  const { data, error } = await client
    .from("groups")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Une una colección a un grupo */
export async function joinGroup(
  client: Client,
  groupId: string,
  collectionId: string,
): Promise<GroupMember> {
  const payload: TablesInsert<"group_members"> = {
    group_id: groupId,
    collection_id: collectionId,
  };

  const { data, error } = await client
    .from("group_members")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Sale de un grupo */
export async function leaveGroup(
  client: Client,
  groupId: string,
  collectionId: string,
): Promise<void> {
  const { error } = await client
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("collection_id", collectionId);

  if (error) throw error;
}

/**
 * Devuelve el grupo con todos sus miembros, sus perfiles y el resumen de su colección.
 * Los miembros vienen ordenados por porcentaje de completitud (leaderboard).
 */
export async function getGroupLeaderboard(
  client: Client,
  groupId: string,
): Promise<GroupWithMembers> {
  // 1. Datos del grupo con el álbum
  const { data: groupData, error: groupError } = await client
    .from("groups")
    .select("*, album:albums(*)")
    .eq("id", groupId)
    .single();

  if (groupError) throw groupError;

  const group = groupData as GroupWithAlbum;

  // 2. Miembros con sus colecciones y perfiles
  const { data: membersData, error: membersError } = await client
    .from("group_members")
    .select(
      `
      *,
      collection:collections(
        *,
        profile:profiles(id, username, display_name, avatar_url, trading_status),
        stickers:collection_stickers(sticker_id, quantity)
      )
    `,
    )
    .eq("group_id", groupId);

  if (membersError) throw membersError;

  const members = membersData as RawMember[];
  const totalStickers = group.album.total_stickers;

  // 3. Calcular el summary de cada miembro y ordenar por completitud
  const membersWithSummary = members
    .map((member) => ({
      ...member,
      collection: {
        ...member.collection,
        summary: computeSummary(member.collection.stickers, totalStickers),
      },
    }))
    .sort(
      (a, b) =>
        b.collection.summary.percentage - a.collection.summary.percentage,
    );

  return {
    ...group,
    members: membersWithSummary,
  } as GroupWithMembers;
}

/** Verifica si una colección ya es miembro de un grupo */
export async function isGroupMember(
  client: Client,
  groupId: string,
  collectionId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("collection_id", collectionId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
