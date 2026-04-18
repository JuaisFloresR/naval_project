import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShipFormData, RowShip } from '@/types';

// Helper: convert Prisma Decimal objects to plain numbers for JSON serialization
function serializeDecimals<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'object' && value !== null && value.constructor?.name === 'Decimal'
      ? Number(value)
      : value
  ));
}

export async function GET() {
  try {
    const ships = await prisma.ship.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { rows: true }
        }
      }
    });
    return NextResponse.json(serializeDecimals(ships));
  } catch (error) {
    console.error('Error fetching ships:', error);
    return NextResponse.json({ error: 'Failed to fetch ships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ShipFormData;
    const { rows, status, description, ...shipData } = body;

    const ship = await prisma.ship.create({
      data: {
        ...shipData,
        description: description ?? '',
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

    return NextResponse.json(serializeDecimals(ship), { status: 201 });
  } catch (error) {
    console.error('Error creating ship:', error);
    return NextResponse.json({ error: 'Failed to create ship' }, { status: 500 });
  }
}
