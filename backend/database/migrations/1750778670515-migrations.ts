import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750778670515 implements MigrationInterface {
    name = 'Migrations1750778670515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD "valued" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP COLUMN "valued"`);
    }

}
