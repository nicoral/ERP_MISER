import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751056693467 implements MigrationInterface {
    name = 'Migrations1751056693467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" ALTER COLUMN "unitPrice" TYPE numeric(15,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" ALTER COLUMN "unitPrice" TYPE numeric(15,4)`);
    }

}
