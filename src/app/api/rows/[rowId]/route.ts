import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/rows/[rowId]
 * Immediately deletes a single RowShip record by its primary key.
 * Called from the Ship Edit page when the user confirms a row deletion.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ rowId: string }> },
) {
  try {
    const { rowId } = await params;

    await prisma.rowShip.delete({
      where: { id: rowId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting RowShip:', error);
    return NextResponse.json({ error: 'Failed to delete row' }, { status: 500 });
  }
}
