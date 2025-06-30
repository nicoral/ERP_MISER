import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751216445526 implements MigrationInterface {
    name = 'Migrations1751216445526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "progress" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "progress"`);
    }

}
