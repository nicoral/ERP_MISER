import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751216909215 implements MigrationInterface {
    name = 'Migrations1751216909215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."quotation_request_status_enum" RENAME TO "quotation_request_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."quotation_request_status_enum" AS ENUM('PENDING', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" TYPE "public"."quotation_request_status_enum" USING "status"::"text"::"public"."quotation_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."quotation_request_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quotation_request_status_enum_old" AS ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" TYPE "public"."quotation_request_status_enum_old" USING "status"::"text"::"public"."quotation_request_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."quotation_request_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."quotation_request_status_enum_old" RENAME TO "quotation_request_status_enum"`);
    }

}
