import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749955261025 implements MigrationInterface {
    name = 'Migrations1749955261025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "area" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "area"`);
    }

}
