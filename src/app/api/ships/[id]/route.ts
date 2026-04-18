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

    // Delete ALL existing rows then recreate from the payload.
    // This is the safest sync strategy — the payload is the authoritative set.
    const ship = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.rowShip.deleteMany({ where: { shipId: id } });

      if (incomingRows.length > 0) {
        await tx.rowShip.createMany({
          data: incomingRows.map((row: RowShip) => ({
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
            shipId:       id,
          })),
        });
      }

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
