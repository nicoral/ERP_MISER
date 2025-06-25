import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750822014693 implements MigrationInterface {
    name = 'Migrations1750822014693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ADD "firstSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "firstSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "firstSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "secondSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "secondSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "secondSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "thirdSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "thirdSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "thirdSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "fourthSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "fourthSignedBy" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "fourthSignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "requirement" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "fourthSignedAt"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "fourthSignedBy"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "fourthSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "thirdSignedAt"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "thirdSignedBy"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "thirdSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "secondSignedAt"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "secondSignedBy"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "secondSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "firstSignedAt"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "firstSignedBy"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "firstSignature"`);
    }

}
