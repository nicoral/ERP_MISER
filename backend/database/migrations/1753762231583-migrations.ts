import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753762231583 implements MigrationInterface {
    name = 'Migrations1753762231583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "licensePlate"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "codeMine"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "code_mine" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "license_plate" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "license_plate"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "code_mine"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "codeMine" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "licensePlate" character varying(255)`);
    }

}
