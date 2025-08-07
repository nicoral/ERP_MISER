import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754539956791 implements MigrationInterface {
    name = 'Migrations1754539956791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment_invoice" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "invoiceImage" text, "purchaseDate" date, "invoiceEmissionDate" date, "documentNumber" character varying(100), "description" text, "amount" numeric(15,2) NOT NULL DEFAULT '0', "retentionAmount" numeric(10,2) NOT NULL DEFAULT '0', "retentionPercentage" numeric(5,2) NOT NULL DEFAULT '3', "hasRetention" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "payment_detail_id" integer, CONSTRAINT "UQ_6db2257b68d0ec44bb4efb80fbe" UNIQUE ("code"), CONSTRAINT "PK_20cc84d8a2274ae86f551360c11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "purchaseDate"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "invoiceEmissionDate"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "documentNumber"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "retentionAmount"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "retentionPercentage"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "hasRetention"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "invoiceImage"`);
        await queryRunner.query(`ALTER TABLE "payment_invoice" ADD CONSTRAINT "FK_277b32ca3b65cc702df665cbddf" FOREIGN KEY ("payment_detail_id") REFERENCES "payment_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_invoice" DROP CONSTRAINT "FK_277b32ca3b65cc702df665cbddf"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "invoiceImage" text`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "hasRetention" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "retentionPercentage" numeric(5,2) NOT NULL DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "retentionAmount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "documentNumber" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "invoiceEmissionDate" date`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "purchaseDate" date`);
        await queryRunner.query(`DROP TABLE "payment_invoice"`);
    }

}
