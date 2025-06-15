import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749783307460 implements MigrationInterface {
    name = 'Migrations1749783307460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "reorder_quantity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "reorder_quantity" integer NOT NULL DEFAULT '0'`);
    }

}
