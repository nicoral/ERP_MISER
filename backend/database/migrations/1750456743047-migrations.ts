import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750456743047 implements MigrationInterface {
    name = 'Migrations1750456743047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "role" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "role" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "brand" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "brand" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "brand" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "article" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "warehouse" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "warehouse" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "created_at"`);
    }

}
