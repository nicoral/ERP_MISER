import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753765577582 implements MigrationInterface {
    name = 'Migrations1753765577582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation" ADD "quotationFile" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation" DROP COLUMN "quotationFile"`);
    }

}
