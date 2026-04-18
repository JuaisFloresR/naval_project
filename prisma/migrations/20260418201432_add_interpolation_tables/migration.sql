-- CreateTable
CREATE TABLE "Interpolation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shipId" TEXT NOT NULL,

    CONSTRAINT "Interpolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterpolationDetail" (
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
    "interpolationId" TEXT NOT NULL,

    CONSTRAINT "InterpolationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interpolation_shipId_idx" ON "Interpolation"("shipId");

-- CreateIndex
CREATE INDEX "InterpolationDetail_interpolationId_idx" ON "InterpolationDetail"("interpolationId");

-- AddForeignKey
ALTER TABLE "Interpolation" ADD CONSTRAINT "Interpolation_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterpolationDetail" ADD CONSTRAINT "InterpolationDetail_interpolationId_fkey" FOREIGN KEY ("interpolationId") REFERENCES "Interpolation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
