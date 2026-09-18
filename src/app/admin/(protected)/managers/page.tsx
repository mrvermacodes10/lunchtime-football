import { prisma } from "@/lib/prisma";
import ManagersAdmin from "@/components/admin/ManagersAdmin";

export default async function AdminManagersPage() {
  const managers = await prisma.manager.findMany({
    include: { _count: { select: { squads: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <ManagersAdmin
      managers={managers.map((m) => ({ id: m.id, name: m.name, squadCount: m._count.squads }))}
    />
  );
}
