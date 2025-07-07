import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751861836621 implements MigrationInterface {
    name = 'Migrations1751861836621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation" ADD "methodOfPayment" text`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation" ADD "igv" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation" DROP COLUMN "igv"`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation" DROP COLUMN "methodOfPayment"`);
    }

}
