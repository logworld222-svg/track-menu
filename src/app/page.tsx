import { MenuError } from "@/components/menu-error";
import { PracticeMenu } from "@/components/practice-menu";
import { getMenu } from "@/lib/menu-server";

export default async function Home() {
  const menu = await getMenu();

  if (!menu) {
    return <MenuError />;
  }

  return <PracticeMenu data={menu} />;
}
