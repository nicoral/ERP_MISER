import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751907383381 implements MigrationInterface {
    name = 'Migrations1751907383381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "supplier_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."quotation_request_status_enum" RENAME TO "quotation_request_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."quotation_request_status_enum" AS ENUM('PENDING', 'DRAFT', 'ACTIVE', 'CANCELLED', 'SIGNED_1', 'SIGNED_2', 'SIGNED_3', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" TYPE "public"."quotation_request_status_enum" USING "status"::"text"::"public"."quotation_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."quotation_request_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_e0c9197cae0e1d8b17d2f5fba2d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_e0c9197cae0e1d8b17d2f5fba2d"`);
        await queryRunner.query(`CREATE TYPE "public"."quotation_request_status_enum_old" AS ENUM('PENDING', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SIGNED_1', 'SIGNED_2', 'SIGNED_3', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" TYPE "public"."quotation_request_status_enum_old" USING "status"::"text"::"public"."quotation_request_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."quotation_request_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."quotation_request_status_enum_old" RENAME TO "quotation_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "supplier_id"`);
    }

}
