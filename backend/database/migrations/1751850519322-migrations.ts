import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751850519322 implements MigrationInterface {
    name = 'Migrations1751850519322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier" ADD "deadline" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_supplier" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD "deadline" date`);
    }

}
