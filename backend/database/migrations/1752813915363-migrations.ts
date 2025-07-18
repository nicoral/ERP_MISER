import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752813915363 implements MigrationInterface {
    name = 'Migrations1752813915363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" ADD "condition" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "department" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "province" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "sunat_status" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "sunat_status"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "province"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "condition"`);
    }

}
