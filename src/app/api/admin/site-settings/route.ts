import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteBlob } from "@/services/blob";
import {
  SITE_SETTINGS_SINGLETON_KEY,
  SiteSettingsModel,
} from "@/models/SiteSettings";
import { siteSettingsUpdateSchema } from "@/lib/validation/siteSettings";
import { getSiteSettingsForAdmin } from "@/lib/siteSettings";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSiteSettingsForAdmin();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = siteSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectDB();

    const prev = await SiteSettingsModel.findOne({
      singletonKey: SITE_SETTINGS_SINGLETON_KEY,
    }).lean();

    const previousUrls = new Set<string>();
    for (const u of prev?.heroImagesDesktop ?? []) previousUrls.add(u);
    for (const u of prev?.heroImagesMobile ?? []) previousUrls.add(u);
    for (const u of prev?.heroImages ?? []) previousUrls.add(u);

    const updated = await SiteSettingsModel.findOneAndUpdate(
      { singletonKey: SITE_SETTINGS_SINGLETON_KEY },
      {
        $set: {
          heroImagesDesktop: parsed.data.heroImagesDesktop,
          heroImagesMobile: parsed.data.heroImagesMobile,
        },
        $unset: { heroImages: "" },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "עדכון נכשל" }, { status: 500 });
    }

    const nextUrls = new Set<string>();
    for (const u of parsed.data.heroImagesDesktop) nextUrls.add(u);
    for (const u of parsed.data.heroImagesMobile) nextUrls.add(u);

    for (const url of previousUrls) {
      if (!nextUrls.has(url)) {
        void deleteBlob(url);
      }
    }

    return NextResponse.json({
      heroImagesDesktop: updated.heroImagesDesktop ?? [],
      heroImagesMobile: updated.heroImagesMobile ?? [],
    });
  } catch (e) {
    console.error("[api/admin/site-settings PATCH]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
