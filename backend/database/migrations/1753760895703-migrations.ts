import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753760895703 implements MigrationInterface {
    name = 'Migrations1753760895703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "technical_sheet_url" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "technical_sheet_url"`);
    }

}
