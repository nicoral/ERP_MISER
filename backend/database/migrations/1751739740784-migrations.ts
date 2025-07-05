import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751739740784 implements MigrationInterface {
    name = 'Migrations1751739740784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "firstSignature" text`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "firstSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "firstSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "secondSignature" text`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "secondSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "secondSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "thirdSignature" text`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "thirdSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "thirdSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "fourthSignature" text`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "fourthSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "fourthSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "rejectedReason" text`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "rejectedBy" integer`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "rejectedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "rejectedAt"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "rejectedBy"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "rejectedReason"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "fourthSignedAt"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "fourthSignedBy"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "fourthSignature"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "thirdSignedAt"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "thirdSignedBy"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "thirdSignature"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "secondSignedAt"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "secondSignedBy"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "secondSignature"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "firstSignedAt"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "firstSignedBy"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "firstSignature"`);
    }

}
