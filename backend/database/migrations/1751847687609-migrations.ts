import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751847687609 implements MigrationInterface {
    name = 'Migrations1751847687609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_settings" ADD "general_tax" numeric(10,2) NOT NULL DEFAULT '18'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_settings" DROP COLUMN "general_tax"`);
    }

}
