import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750048446222 implements MigrationInterface {
    name = 'Migrations1750048446222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" ADD "url" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP COLUMN "url"`);
    }

}
