import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751844516717 implements MigrationInterface {
    name = 'Migrations1751844516717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_detail_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_detail_physicalreceipt_enum" AS ENUM('YES', 'NO')`);
        await queryRunner.query(`CREATE TABLE "payment_detail" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "status" "public"."payment_detail_status_enum" NOT NULL DEFAULT 'PENDING', "amount" numeric(15,2) NOT NULL DEFAULT '0', "paymentReceipt" text, "depositDate" date, "movementNumber" character varying(100), "receiptImage" text, "physicalReceipt" "public"."payment_detail_physicalreceipt_enum", "purchaseDate" date, "invoiceEmissionDate" date, "documentNumber" character varying(100), "description" text, "retentionAmount" numeric(10,2) NOT NULL DEFAULT '0', "retentionPercentage" numeric(5,2) NOT NULL DEFAULT '3', "hasRetention" boolean NOT NULL DEFAULT false, "rejectionReason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "payment_group_id" integer, "created_by" integer, "approved_by" integer, CONSTRAINT "UQ_fdf30a0462a3bdfc1125d21b4bc" UNIQUE ("code"), CONSTRAINT "PK_baeeedc69241f6ea2ee27443dc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_group_status_enum" AS ENUM('PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "payment_group" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "status" "public"."payment_group_status_enum" NOT NULL DEFAULT 'PENDING', "totalAmount" numeric(15,2) NOT NULL DEFAULT '0', "paidAmount" numeric(15,2) NOT NULL DEFAULT '0', "pendingAmount" numeric(15,2) NOT NULL DEFAULT '0', "description" text, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer, "created_by" integer, "approved_by" integer, CONSTRAINT "UQ_e8fe08f499c0f40940c9b6bd426" UNIQUE ("code"), CONSTRAINT "PK_845e2ab086335e28c1d40d89d6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "totalAmount" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "paidAmount" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "pendingAmount" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e" FOREIGN KEY ("payment_group_id") REFERENCES "payment_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_100fb15d5b419c57caee67bdcdc" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_17bcc738aa1d66789e7f65cfdce" FOREIGN KEY ("approved_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_be6b20f842968065879a2d411d3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_01a53c6dc74c48dd57895022385" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_035a9eff40e000cc3c66d8e7d6f" FOREIGN KEY ("approved_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_035a9eff40e000cc3c66d8e7d6f"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_01a53c6dc74c48dd57895022385"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_17bcc738aa1d66789e7f65cfdce"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_100fb15d5b419c57caee67bdcdc"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "pendingAmount"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "paidAmount"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "payment_group"`);
        await queryRunner.query(`DROP TYPE "public"."payment_group_status_enum"`);
        await queryRunner.query(`DROP TABLE "payment_detail"`);
        await queryRunner.query(`DROP TYPE "public"."payment_detail_physicalreceipt_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_detail_status_enum"`);
    }

}
