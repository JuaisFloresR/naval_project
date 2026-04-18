import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

// Helper: convert Prisma Decimal objects to plain numbers for JSON serialization
function serializeDecimals<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'object' && value !== null && value.constructor?.name === 'Decimal'
      ? Number(value)
      : value
  ));
}

/** GET /api/interpolation/[id] — fetch a single interpolation with its details */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const record = await prisma.interpolation.findUnique({
      where: { id },
      include: {
        ship: { select: { id: true, name: true } },
        details: { orderBy: { draft: 'asc' } },
        _count: { select: { details: true } },
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Interpolation not found' }, { status: 404 });
    }

    return NextResponse.json(serializeDecimals(record));
  } catch (error) {
    console.error('Error fetching interpolation:', error);
    return NextResponse.json({ error: 'Failed to fetch interpolation' }, { status: 500 });
  }
}

/** PUT /api/interpolation/[id] — replace an interpolation's details */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json() as { shipId: string; details: Record<string, number>[] };
    const { shipId, details } = body;

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete all existing detail rows
      await tx.interpolationDetail.deleteMany({ where: { interpolationId: id } });

      // Update the parent record and recreate details
      return tx.interpolation.update({
        where: { id },
        data: {
          shipId,
          details: {
            create: details.map((row) => ({
              draft:        row.draft,
              displacement: row.displacement,
              wl_length:    row.wl_length,
              wl_beam:      row.wl_beam,
              wetted_area:  row.wetted_area,
              waterpl_area: row.waterpl_area,
              cp:           row.cp,
              cb:           row.cb,
              cm:           row.cm,
              cwp:          row.cwp,
              lcb:          row.lcb,
              lcf:          row.lcf,
              kb:           row.kb,
              bmt:          row.bmt,
              bml:          row.bml,
              gmt:          row.gmt,
              gml:          row.gml,
              kmt:          row.kmt,
              kml:          row.kml,
              tpc:          row.tpc,
              mtc:          row.mtc,
              rm_at_1deg:   row.rm_at_1deg,
            })),
          },
        },
        include: {
          ship: { select: { id: true, name: true } },
          details: { orderBy: { draft: 'asc' } },
          _count: { select: { details: true } },
        },
      });
    });

    return NextResponse.json(serializeDecimals(updated));
  } catch (error) {
    console.error('Error updating interpolation:', error);
    return NextResponse.json({ error: 'Failed to update interpolation' }, { status: 500 });
  }
}

/** DELETE /api/interpolation/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.interpolationDetail.deleteMany({ where: { interpolationId: id } });
      await tx.interpolation.delete({ where: { id } });
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting interpolation:', error);
    return NextResponse.json({ error: 'Failed to delete interpolation' }, { status: 500 });
  }
}
