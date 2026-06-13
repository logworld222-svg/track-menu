import { MenuAdmin } from "@/components/menu-admin";
import { FALLBACK_MENU, getMenu } from "@/lib/menu-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const menu = await getMenu();

  return (
    <MenuAdmin
      initialData={menu ?? FALLBACK_MENU}
      loadFailed={menu === null}
    />
  );
}
