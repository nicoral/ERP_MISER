import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750043455672 implements MigrationInterface {
    name = 'Migrations1750043455672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" ADD "lines" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "lines"`);
    }

}
