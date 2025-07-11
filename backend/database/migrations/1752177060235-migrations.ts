import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752177060235 implements MigrationInterface {
    name = 'Migrations1752177060235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "bank_account"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "bank_account_pen" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "interbank_account_pen" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "entity_bank_account_pen" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "bank_account_usd" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "interbank_account_usd" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "entity_bank_account_usd" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "applies_withholding" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "applies_withholding"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "entity_bank_account_usd"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "interbank_account_usd"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "bank_account_usd"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "entity_bank_account_pen"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "interbank_account_pen"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "bank_account_pen"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "bank_account" character varying(100)`);
    }

}
