-- CreateEnum
CREATE TYPE "public"."ShipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RETIRED', 'UNDER_REPAIR');

-- CreateTable
CREATE TABLE "public"."Ship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "length" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."ShipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowShip" (
    "id" TEXT NOT NULL,
    "draft" DECIMAL(65,30) NOT NULL,
    "displacement" DECIMAL(65,30) NOT NULL,
    "wl_length" DECIMAL(65,30) NOT NULL,
    "wl_beam" DECIMAL(65,30) NOT NULL,
    "wetted_area" DECIMAL(65,30) NOT NULL,
    "waterpl_area" DECIMAL(65,30) NOT NULL,
    "cp" DECIMAL(65,30) NOT NULL,
    "cb" DECIMAL(65,30) NOT NULL,
    "cm" DECIMAL(65,30) NOT NULL,
    "cwp" DECIMAL(65,30) NOT NULL,
    "lcb" DECIMAL(65,30) NOT NULL,
    "lcf" DECIMAL(65,30) NOT NULL,
    "kb" DECIMAL(65,30) NOT NULL,
    "bmt" DECIMAL(65,30) NOT NULL,
    "bml" DECIMAL(65,30) NOT NULL,
    "gmt" DECIMAL(65,30) NOT NULL,
    "gml" DECIMAL(65,30) NOT NULL,
    "kmt" DECIMAL(65,30) NOT NULL,
    "kml" DECIMAL(65,30) NOT NULL,
    "tpc" DECIMAL(65,30) NOT NULL,
    "mtc" DECIMAL(65,30) NOT NULL,
    "rm_at_1deg" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipId" TEXT NOT NULL,

    CONSTRAINT "RowShip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RowShip_shipId_idx" ON "public"."RowShip"("shipId");

-- AddForeignKey
ALTER TABLE "public"."RowShip" ADD CONSTRAINT "RowShip_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "public"."Ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
