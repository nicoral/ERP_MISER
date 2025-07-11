import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752264598727 implements MigrationInterface {
    name = 'Migrations1752264598727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part_article" ADD "valued" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part_article" DROP COLUMN "valued"`);
    }

}
