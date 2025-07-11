import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752174417133 implements MigrationInterface {
    name = 'Migrations1752174417133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "model" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "brand" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "licensePlate" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "owner" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "code" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "serial"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "serial" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "codeMine"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "codeMine" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "codeMine"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "codeMine" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "serial"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "serial" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "code" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "owner"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "licensePlate"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "brand"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "model"`);
    }

}
