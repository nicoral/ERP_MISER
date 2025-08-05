import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754195278086 implements MigrationInterface {
    name = 'Migrations1754195278086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "quotation_request_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "quotation_request_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
