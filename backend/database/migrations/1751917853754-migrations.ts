import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751917853754 implements MigrationInterface {
    name = 'Migrations1751917853754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "invoiceImage" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "invoiceImage"`);
    }

}
