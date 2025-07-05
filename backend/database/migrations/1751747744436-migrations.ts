import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751747744436 implements MigrationInterface {
    name = 'Migrations1751747744436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_physicalreceipt_enum" AS ENUM('YES', 'NO')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "paymentReceipt" text, "depositDate" date, "movementNumber" character varying(100), "receiptImage" text, "physicalReceipt" "public"."payment_physicalreceipt_enum", "purchaseDate" date, "invoiceEmissionDate" date, "documentNumber" character varying(100), "description" text, "amount" numeric(10,2) NOT NULL DEFAULT '0', "retentionAmount" numeric(10,2) NOT NULL DEFAULT '0', "retentionPercentage" numeric(5,2) NOT NULL DEFAULT '3', "hasRetention" boolean NOT NULL DEFAULT false, "rejectionReason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer, "created_by" integer, "approved_by" integer, CONSTRAINT "UQ_a8816ab86cdecd6cc7f576ff82f" UNIQUE ("code"), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_e9c33eac26c362b60c249f64c92" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_e91eb2a79e0ca14007b6c3e4445" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_917cb567b9912f614c623bd2879" FOREIGN KEY ("approved_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_917cb567b9912f614c623bd2879"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_e91eb2a79e0ca14007b6c3e4445"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_e9c33eac26c362b60c249f64c92"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_physicalreceipt_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    }

}
