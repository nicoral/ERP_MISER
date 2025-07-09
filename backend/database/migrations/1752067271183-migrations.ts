import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752067271183 implements MigrationInterface {
    name = 'Migrations1752067271183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_01a53c6dc74c48dd57895022385"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "UQ_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP COLUMN "quotation_request_id"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD "purchase_order_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "UQ_05d792943974775d31c0fd3033e" UNIQUE ("purchase_order_id")`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "payment_group_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_05d792943974775d31c0fd3033e" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e" FOREIGN KEY ("payment_group_id") REFERENCES "payment_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_05d792943974775d31c0fd3033e"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "payment_group_id"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "UQ_05d792943974775d31c0fd3033e"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP COLUMN "purchase_order_id"`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD "quotation_request_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "UQ_be6b20f842968065879a2d411d3" UNIQUE ("quotation_request_id")`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_be6b20f842968065879a2d411d3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_01a53c6dc74c48dd57895022385" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
