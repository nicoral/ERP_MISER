import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751168113014 implements MigrationInterface {
    name = 'Migrations1751168113014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "final_selection" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "final_selection" DROP COLUMN "purchaseOrderNumber"`);
        await queryRunner.query(`ALTER TABLE "final_selection" DROP CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191"`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD CONSTRAINT "UQ_14a6a6f37721a1f12cd6f250191" UNIQUE ("quotation_request_id")`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "final_selection" DROP CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191"`);
        await queryRunner.query(`ALTER TABLE "final_selection" DROP CONSTRAINT "UQ_14a6a6f37721a1f12cd6f250191"`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD "purchaseOrderNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD "currency" character varying NOT NULL DEFAULT 'PEN'`);
    }

}
