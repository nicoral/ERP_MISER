import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750043501437 implements MigrationInterface {
    name = 'Migrations1750043501437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "lines"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "lines" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "lines"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "lines" character varying(100)`);
    }

}
