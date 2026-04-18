import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InterpolationFormData } from '@/types';

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
    const interpolations = await prisma.interpolation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ship: {
          select: { id: true, name: true },
        },
        _count: {
          select: { details: true },
        },
      },
    });
    return NextResponse.json(serializeDecimals(interpolations));
  } catch (error) {
    console.error('Error fetching interpolations:', error);
    return NextResponse.json({ error: 'Failed to fetch interpolations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as InterpolationFormData;
    const { shipId, details } = body;

    const interpolation = await prisma.interpolation.create({
      data: {
        shipId,
        details: {
          create: details?.map((row) => ({
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
          })) ?? [],
        },
      },
      include: {
        ship: { select: { id: true, name: true } },
        details: true,
        _count: { select: { details: true } },
      },
    });

    return NextResponse.json(serializeDecimals(interpolation), { status: 201 });
  } catch (error) {
    console.error('Error creating interpolation:', error);
    return NextResponse.json({ error: 'Failed to create interpolation' }, { status: 500 });
  }
}
