import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754020290623 implements MigrationInterface {
    name = 'Migrations1754020290623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "firstSignature" text`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "firstSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "firstSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "secondSignature" text`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "secondSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "secondSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "thirdSignature" text`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "thirdSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "thirdSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "fourthSignature" text`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "fourthSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "fourthSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "rejectedReason" text`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "rejectedBy" integer`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "rejectedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('PENDING', 'SIGNED_1', 'SIGNED_2', 'SIGNED_3', 'SIGNED_4', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" "public"."purchase_order_status_enum" NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "rejectedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "rejectedBy"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "rejectedReason"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "fourthSignedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "fourthSignedBy"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "fourthSignature"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "thirdSignedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "thirdSignedBy"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "thirdSignature"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "secondSignedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "secondSignedBy"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "secondSignature"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "firstSignedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "firstSignedBy"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "firstSignature"`);
    }

}
