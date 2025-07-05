import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751689418903 implements MigrationInterface {
    name = 'Migrations1751689418903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(100) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "firstSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "firstSignature" text`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "secondSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "secondSignature" text`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "thirdSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "thirdSignature" text`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "fourthSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "fourthSignature" text`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "rejectedReason"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "rejectedReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "rejectedReason"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "rejectedReason" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "fourthSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "fourthSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "thirdSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "thirdSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "secondSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "secondSignature" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "firstSignature"`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "firstSignature" character varying`);
        await queryRunner.query(`DROP TABLE "service"`);
    }

}
