import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { ShipFormData, RowShip } from '@/types';

// Helper: convert Prisma Decimal objects to plain numbers for JSON serialization
function serializeDecimals<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'object' && value !== null && value.constructor?.name === 'Decimal'
      ? Number(value)
      : value
  ));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ship = await prisma.ship.findUnique({
      where: { id },
      include: { rows: { orderBy: { createdAt: 'asc' } } }
    });

    if (!ship) {
      return NextResponse.json({ error: 'Ship not found' }, { status: 404 });
    }

    return NextResponse.json(serializeDecimals(ship));
  } catch (error) {
    console.error('Error fetching ship:', error);
    return NextResponse.json({ error: 'Failed to fetch ship' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as ShipFormData;
    const { rows, status, description, ...shipData } = body;

    const incomingRows = rows ?? [];

    // Rows loaded from the DB have a standard UUID (8-4-4-4-12 hex).
    // Rows added in the UI before saving receive fake ids like "row-1234567890".
    const isRealId = (rowId: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rowId);

    const ship = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

      // NOTE: No orphan-row cleanup here.
      // Row deletion is handled immediately and atomically by the dedicated
      // endpoint: DELETE /api/rows/[rowId]
      // By the time this PUT runs, any removed rows are already gone from the DB.

      // Upsert each row in the payload:
      //   • Real UUID  → UPDATE in place (preserves id, createdAt, and any FKs)
      //   • Fake / new → CREATE a fresh record (Prisma generates the UUID)
      for (const row of incomingRows) {
        const {
          draft, displacement, wl_length, wl_beam, wetted_area, waterpl_area,
          cp, cb, cm, cwp, lcb, lcf, kb, bmt, bml, gmt, gml, kmt, kml,
          tpc, mtc, rm_at_1deg,
        } = row;

        const rowData = {
          draft, displacement, wl_length, wl_beam, wetted_area, waterpl_area,
          cp, cb, cm, cwp, lcb, lcf, kb, bmt, bml, gmt, gml, kmt, kml,
          tpc, mtc, rm_at_1deg,
        };

        if (isRealId(row.id)) {
          await tx.rowShip.update({ where: { id: row.id }, data: rowData });
        } else {
          await tx.rowShip.create({ data: { ...rowData, shipId: id } });
        }
      }

      // Update the ship's own scalar fields
      return tx.ship.update({
        where: { id },
        data: {
          ...shipData,
          description: description ?? '',
          status: status || 'ACTIVE',
        },
        include: { rows: { orderBy: { createdAt: 'asc' } } },
      });
    });

    return NextResponse.json(serializeDecimals(ship));
  } catch (error) {
    console.error('Error updating ship:', error);
    return NextResponse.json({ error: 'Failed to update ship' }, { status: 500 });
  }
}



export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Transaction needed because there is no onDelete: Cascade in schema
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.rowShip.deleteMany({
        where: { shipId: id }
      });
      await tx.ship.delete({
        where: { id }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting ship:', error);
    return NextResponse.json({ error: 'Failed to delete ship' }, { status: 500 });
  }
}
