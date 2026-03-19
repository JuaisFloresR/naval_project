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
    const { rows, status, ...shipData } = body;

    // Use a transaction to delete old rows and create new ones
    const ship = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing rows
      await tx.rowShip.deleteMany({
        where: { shipId: id }
      });

      // Update ship and create new rows
      return await tx.ship.update({
        where: { id },
        data: {
          ...shipData,
          status: status || 'ACTIVE',
          rows: {
            create: rows?.map((row: RowShip) => {
              const { draft, displacement, wl_length, wl_beam, wetted_area, waterpl_area, cp, cb, cm, cwp, lcb, lcf, kb, bmt, bml, gmt, gml, kmt, kml, tpc, mtc, rm_at_1deg } = row;
              return { draft, displacement, wl_length, wl_beam, wetted_area, waterpl_area, cp, cb, cm, cwp, lcb, lcf, kb, bmt, bml, gmt, gml, kmt, kml, tpc, mtc, rm_at_1deg };
            }) || []
          }
        },
        include: { rows: true }
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
